import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const PLAN_MAP: Record<string, string> = {
  "prod_TysnxyPY7dXqVK": "starter",
  "prod_TytgUGD2tNKYbs": "pro",
  "prod_TytgzeWLP67bjX": "business",
};

serve(async (req) => {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    return new Response("Server misconfigured", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("No signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    console.error("[WEBHOOK] Signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  console.log(`[WEBHOOK] Event: ${event.type}`);

  const createNotification = async (userId: string, title: string, message: string) => {
    try {
      await supabase.from("notifications").insert({
        user_id: userId,
        type: "subscription",
        title,
        message,
        is_read: false,
      });
    } catch (e) {
      console.error("[WEBHOOK] Failed to create notification:", e);
    }
  };

  const updatePlanByCustomerId = async (customerId: string, plan: string, notifTitle?: string, notifMessage?: string) => {
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
    if (!customer.email) return;

    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users?.users?.find((u) => u.email === customer.email);
    if (!user) return;

    // Don't override master plan
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile?.plan === "master") return;

    await supabase.from("profiles").update({ plan }).eq("user_id", user.id);
    console.log(`[WEBHOOK] Updated ${customer.email} to plan: ${plan}`);

    // Send notification
    if (notifTitle && notifMessage) {
      await createNotification(user.id, notifTitle, notifMessage);
    }
  };

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        if (sub.status === "active" || sub.status === "trialing") {
          const productId = sub.items.data[0]?.price?.product as string;
          const plan = PLAN_MAP[productId] || "starter";
          const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);
          await updatePlanByCustomerId(
            sub.customer as string,
            plan,
            `✅ Plano ${planLabel} ativado!`,
            `Seu plano ${planLabel} está ativo. Aproveite todos os recursos disponíveis!`
          );
        } else if (sub.status === "canceled" || sub.status === "unpaid" || sub.status === "past_due") {
          await updatePlanByCustomerId(
            sub.customer as string,
            "free",
            "⚠️ Assinatura encerrada",
            "Sua assinatura foi encerrada. Você está no plano gratuito. Faça upgrade para continuar usando os recursos premium."
          );
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await updatePlanByCustomerId(
          sub.customer as string,
          "free",
          "❌ Assinatura cancelada",
          "Sua assinatura foi cancelada. Você voltou ao plano gratuito. Esperamos ter você de volta!"
        );
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.customer) {
          console.log(`[WEBHOOK] Payment failed for customer ${invoice.customer}`);
          // Find user and send notification
          const customer = await stripe.customers.retrieve(invoice.customer as string) as Stripe.Customer;
          if (customer.email) {
            const { data: users } = await supabase.auth.admin.listUsers();
            const user = users?.users?.find((u) => u.email === customer.email);
            if (user) {
              await createNotification(
                user.id,
                "💳 Falha no pagamento",
                "Houve um problema ao processar seu pagamento. Atualize seus dados de pagamento para evitar a suspensão do plano."
              );
            }
          }
        }
        break;
      }
      default:
        console.log(`[WEBHOOK] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error("[WEBHOOK] Error processing event:", err);
    return new Response("Webhook handler error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
