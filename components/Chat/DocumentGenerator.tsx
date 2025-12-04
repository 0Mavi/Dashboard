'use client';

import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { useApi } from '@/hooks/useApi';
import { toast } from "sonner";

interface DocumentGeneratorProps {
  planId: string;
  googleId: string;
 
  topics?: string[];
  activities?: string[];
  className?: string;
}

export function DocumentGenerator({ 
  planId, 
  googleId,
  className 
}: DocumentGeneratorProps) {
  
  const { download, loading } = useApi();


  const generateWordFromJSON = (data: any, filename: string) => {
    try {
      const content = typeof data === 'string' ? JSON.parse(data) : data;
      const items = Array.isArray(content) ? content : [content];

      let htmlBody = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>Plano de Estudo</title></head>
        <body>
        <h1>Plano de Estudos Gerado via IA</h1>
        <hr/>
      `;

      items.forEach((item: any, index: number) => {
     
        const obj = item.atividade || item.topico || item;

        htmlBody += `
          <div style="margin-bottom: 20px; padding: 10px; border: 1px solid #ddd;">
            <h2 style="color: #2563eb;">${index + 1}. ${obj.titulo || "Atividade Sem Título"}</h2>
            ${obj.descricao ? `<p><strong>Descrição:</strong> ${obj.descricao}</p>` : ''}
            ${obj.paragrafo ? `<p>${obj.paragrafo}</p>` : ''}
            
            ${obj.conhecimentos_esperados ? `
              <h3>Conhecimentos Esperados:</h3>
              <ul>
                ${Array.isArray(obj.conhecimentos_esperados) 
                  ? obj.conhecimentos_esperados.map((c: string) => `<li>${c}</li>`).join('') 
                  : `<li>${obj.conhecimentos_esperados}</li>`}
              </ul>
            ` : ''}
            
            ${obj.justificativa ? `<p><em><strong>Justificativa:</strong> ${obj.justificativa}</em></p>` : ''}
          </div>
          <br/>
        `;
      });

      htmlBody += "</body></html>";

      const blob = new Blob(['\ufeff', htmlBody], {
        type: 'application/msword'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Documento gerado e baixado!");

    } catch (e) {
      console.error("Erro ao converter JSON para Doc:", e);
      toast.error("Erro ao formatar os dados para o documento.");
    }
  };

  const handleGenerateDoc = async () => {
    if (!googleId) {
      toast.error("Erro: Usuário não identificado.");
      return;
    }

 
    const payload = {
      google_id: googleId,
      plano_ensino_id: planId
    };

    try {
      toast.info("Processando...", { description: "Obtendo dados do servidor..." });
      
      const response = await download('/gerar_documentos/', payload);

      if (response.ok && response.data) {
        const blob = response.data;
        
    
        if (blob.type === 'application/json' || blob.type.includes('json')) {
            const text = await blob.text();
            console.log("Recebi JSON do servidor, convertendo para DOC...", text);
         
            generateWordFromJSON(text, `plano-${planId}.doc`);
            return; 
        }

  
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const fileName = response.filename || `plano-${planId}.docx`;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success("Download concluído!");

      } else {
     
        let msg = "Erro desconhecido.";
        if (response.data instanceof Blob) {
             msg = await response.data.text();
        } else if (response.data?.message) {
             msg = response.data.message;
        }
        console.error("Erro API:", response);
    
        try {
            const parsed = JSON.parse(msg);
            msg = parsed.detail || parsed.message || msg;
        } catch {}
        
        toast.error(`Falha: ${msg.slice(0, 100)}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Falha na comunicação.");
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
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
      {loading ? "Baixar Doc" : "Baixar Material"}
    </Button>
  );
}