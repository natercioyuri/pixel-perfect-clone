import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useViralProducts } from "@/hooks/useViralProducts";
import { toast } from "@/hooks/use-toast";
import {
  Wand2, ImageIcon, ShoppingBag, Loader2, Download, Copy, Upload, X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const VideoGenerationTab = () => {
  const [prompt, setPrompt] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [script, setScript] = useState<string | null>(null);
  const [mode, setMode] = useState<"text" | "image" | "product">("text");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: products } = useViralProducts({ category: "Todos", sortBy: "trending", search: "" });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const generate = async (finalPrompt: string) => {
    setGenerating(true);
    setScript(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-video", {
        body: { action: "generate", prompt: finalPrompt },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setScript(data.script || data.message || "Script gerado com sucesso!");
      toast({ title: "Script gerado com sucesso! 🎬" });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Erro na geração", description: e.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: "Escreva um prompt", variant: "destructive" });
      return;
    }
    await generate(prompt);
  };

  const handleProductGenerate = async (productName: string) => {
    const p = `Create a viral TikTok video script promoting the product "${productName}". Include scenes, camera angles, trendy transitions, text overlays, and a strong opening hook. All directions in English, but spoken lines and on-screen text for the audience must be in Brazilian Portuguese.`;
    setPrompt(p);
    setMode("product");
    await generate(p);
  };

  const handleCopy = () => {
    if (!script) return;
    navigator.clipboard.writeText(script);
    toast({ title: "Script copiado!" });
  };

  const handleDownload = () => {
    if (!script) return;
    const blob = new Blob([script], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `script-video-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
        <TabsList className="bg-secondary">
          <TabsTrigger value="text" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Wand2 className="w-4 h-4 mr-2" />
            Prompt Livre
          </TabsTrigger>
          <TabsTrigger value="image" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <ImageIcon className="w-4 h-4 mr-2" />
            A partir de Imagem
          </TabsTrigger>
          <TabsTrigger value="product" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <ShoppingBag className="w-4 h-4 mr-2" />
            De Produto Viral
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-4">
          <div className="glass rounded-xl p-6 space-y-4">
            <h3 className="font-display font-semibold text-lg">Descreva o roteiro que deseja criar</h3>
            <p className="text-sm text-muted-foreground">A IA vai gerar um roteiro completo com cenas, transições e textos de overlay. Direções em inglês, falas em PT-BR.</p>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Um close-up cinematográfico de um produto de skincare sendo aplicado com iluminação suave e fundo minimalista..."
              className="min-h-[120px] bg-background/50"
            />
            <Button onClick={handleGenerate} disabled={generating} className="w-full">
              {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
              {generating ? "Gerando roteiro..." : "Gerar Roteiro com IA"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="image" className="space-y-4">
          <div className="glass rounded-xl p-6 space-y-4">
            <h3 className="font-display font-semibold text-lg">Upload de imagem + prompt</h3>
            <div
              className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <div className="relative inline-block">
                  <img src={imagePreview} alt="Preview" className="max-h-48 rounded-lg mx-auto" />
                  <button
                    onClick={(e) => { e.stopPropagation(); clearImage(); }}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Clique para selecionar uma imagem</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Descreva o vídeo baseado nesta imagem..."
              className="min-h-[80px] bg-background/50"
            />
            <Button onClick={handleGenerate} disabled={generating} className="w-full">
              {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-2" />}
              {generating ? "Gerando roteiro..." : "Gerar Roteiro a partir da Imagem"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="product" className="space-y-4">
          <div className="glass rounded-xl p-6">
            <h3 className="font-display font-semibold text-lg mb-4">Escolha um produto viral para gerar roteiro</h3>
            {products && products.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {products.slice(0, 9).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleProductGenerate(p.product_name)}
                    disabled={generating}
                    className="glass rounded-lg p-3 text-left hover:ring-2 ring-primary transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      {p.product_image ? (
                        <img
                          src={p.product_image}
                          alt={p.product_name}
                          className="w-12 h-12 rounded-lg object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                          {p.product_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{p.category || "Sem categoria"}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum produto encontrado. Busque produtos virais primeiro.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <AnimatePresence>
        {script && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass rounded-xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-primary" />
                Roteiro Gerado
              </h3>
              <div className="flex gap-2">
                <Button onClick={handleCopy} variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </Button>
                <Button onClick={handleDownload} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            <div className="bg-background/50 rounded-lg p-4 max-h-[500px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-foreground font-body leading-relaxed">
                {script}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {generating && (
        <div className="glass rounded-xl p-8 text-center space-y-4">
          <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Gerando roteiro com IA...</p>
          <p className="text-xs text-muted-foreground">Isso pode levar alguns segundos</p>
        </div>
      )}
    </div>
  );
};

export default VideoGenerationTab;
