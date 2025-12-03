'use client';

import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { useApi } from '@/hooks/useApi';
import { toast } from "sonner";

interface DocumentGeneratorProps {
  planId: string; 
  topics: string[]; 
  className?: string;
}

export function DocumentGenerator({ planId, topics, className }: DocumentGeneratorProps) {
  const { download, loading } = useApi();

  const handleGenerateDoc = async () => {
    if (!planId) {
      toast.error("ID do plano não encontrado.");
      return;
    }

 
    const payload = {
      requisicao_id: planId,
      topicos: topics, 
      atividades: ["Resumo Teórico", "Exercícios Práticos", "Mapa Mental"]
    };

    try {
      toast.info("A iniciar geração do documento...", {
        description: "Isso pode levar alguns segundos. Por favor aguarde.",
        duration: 4000
      });
      
      const response = await download('/gerar_documentos/', payload);

      if (response.ok && response.data) {
       
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', response.filename || `plano-${planId}.docx`);
        document.body.appendChild(link);
        link.click();
        
      
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toast.success("Documento baixado com sucesso!");
      } else {
        toast.error("Erro ao gerar o documento.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Falha na comunicação com o servidor.");
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleGenerateDoc} 
      disabled={loading}
      className={`gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary ${className}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      {loading ? "A Gerar..." : "Baixar Material"}
    </Button>
  );
}