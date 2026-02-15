import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

const PageTitle = ({ title }: { title: string }) => {
  useEffect(() => {
    document.title = title;
  }, [title]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<><PageTitle title="Vyral — Descubra Produtos Virais do TikTok Shop" /><Index /></>} />
            <Route path="/login" element={<><PageTitle title="Entrar — Vyral" /><Login /></>} />
            <Route path="/signup" element={<><PageTitle title="Criar Conta — Vyral" /><Signup /></>} />
            <Route path="/reset-password" element={<><PageTitle title="Recuperar Senha — Vyral" /><ResetPassword /></>} />
            <Route path="/update-password" element={<><PageTitle title="Nova Senha — Vyral" /><UpdatePassword /></>} />
            <Route path="/dashboard" element={<ProtectedRoute><PageTitle title="Dashboard — Vyral" /><Dashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><PageTitle title="Admin — Vyral" /><AdminPanel /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
