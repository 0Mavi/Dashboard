'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  FileDown, 
  Loader2, 
  ChevronDown, 
  BookOpen, 
  CheckSquare, 
  FileText 
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useApi } from '@/hooks/useApi';
import { toast } from "sonner";
import { apiPost } from "@/lib/api"; 

interface DocumentGeneratorProps {
  planId: string;
  googleId: string;
  planName?: string;
  className?: string;
}

export function DocumentGenerator({ 
  planId, 
  googleId,
  planName = "plano", 
  className 
}: DocumentGeneratorProps) {
  
  const { download, loading } = useApi();
  const [isGenerating, setIsGenerating] = useState(false);

  const sanitizeFilename = (name: string, suffix: string) => {
    const cleanName = name
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
      .replace(/[^a-z0-9]/g, "_"); 
    
    return `${cleanName}-${suffix}.doc`;
  };

  const normalizeData = (item: any) => {
      if (!item) return null;
      if (Array.isArray(item)) return normalizeData(item[0]);
      if (item.atividade) return normalizeData(item.atividade);
      if (item.topico && typeof item.topico === 'object') return normalizeData(item.topico);
      return item;
  };

  const generateWordFromJSON = (data: any, title: string, filename: string) => {
    try {
      const items = Array.isArray(data) ? data : [data];

      let htmlBody = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>${title}</title></head>
        <body style="font-family: Arial, sans-serif;">
        <h1 style="color: #111;">${title}</h1>
        <h2 style="color: #555;">${planName}</h2> <hr/>
      `;


      items.forEach((rawItem: any, index: number) => {
        const obj = normalizeData(rawItem);
        if (!obj) return;

        const itemTitle = obj.titulo || obj.nome || obj.topic || `Item ${index + 1}`;

        htmlBody += `
          <div style="margin-bottom: 25px; padding: 15px; border: 1px solid #ccc; background-color: #fafafa;">
            <h2 style="color: #2563eb; margin-top: 0;">${index + 1}. ${itemTitle}</h2>
            ${obj.descricao ? `<p><strong>Descrição:</strong><br/>${obj.descricao}</p>` : ''}
            
            ${obj.objetivos && Array.isArray(obj.objetivos) && obj.objetivos.length > 0 ? `
              <p><strong>Objetivos:</strong></p>
              <ul>${obj.objetivos.map((o: string) => `<li>${o}</li>`).join('')}</ul>
            ` : ''}

            ${obj.conhecimentos_esperados && Array.isArray(obj.conhecimentos_esperados) && obj.conhecimentos_esperados.length > 0 ? `
              <p><strong>Conhecimentos Esperados:</strong></p>
              <ul>${obj.conhecimentos_esperados.map((c: string) => `<li>${c}</li>`).join('')}</ul>
            ` : ''}
            
            ${obj.dias && Array.isArray(obj.dias) ? `
               <p style="color: #666; font-size: 0.9em; margin-top: 10px;">
                 <strong>Datas:</strong> ${obj.dias.map((d: string) => d.split('T')[0]).join(', ')}
               </p>
            ` : ''}

            ${obj.justificativa ? `<p style="margin-top:10px; border-top: 1px dashed #ddd; padding-top: 5px;"><em><strong>Justificativa:</strong> ${obj.justificativa}</em></p>` : ''}
          </div>
        `;
      });

      htmlBody += "</body></html>";

      const blob = new Blob(['\ufeff', htmlBody], { type: 'application/msword' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
 
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`${title} baixado!`);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao gerar arquivo.");
    }
  };

  const handleDownloadActivities = async () => {
    setIsGenerating(true);
    toast.info("Buscando atividades...");
    try {
      const planRes = await apiPost('/plano/', { plano_id: planId });
      if (!planRes.ok || !planRes.data) throw new Error("Erro plano");

      const activityIds = planRes.data.atividades || planRes.data.atividades_praticas || [];
      if (activityIds.length === 0) {
        toast.warning("Sem atividades.");
        setIsGenerating(false);
        return;
      }

      let activitiesData = [];
      if (typeof activityIds[0] === 'string') {
          const promises = activityIds.map(async (id: string) => {
             try {
                 const res = await apiPost('/atividade/', { atividade_id: id });
                 return (res.ok && res.data) ? res.data : null;
             } catch { return null; }
          });
          const results = await Promise.all(promises);
          activitiesData = results.filter(Boolean);
      } else {
          activitiesData = activityIds;
      }

      if (activitiesData.length === 0) {
          toast.error("Erro ao buscar detalhes.");
          setIsGenerating(false);
          return;
      }

 
      const fileName = sanitizeFilename(planName, "atividades");
      generateWordFromJSON(activitiesData, `Atividades - ${planName}`, fileName);

    } catch (error) {
      console.error(error);
      toast.error("Erro ao baixar.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadTopics = async () => {
    setIsGenerating(true);
    toast.info("Buscando tópicos...");
    try {
      const planRes = await apiPost('/plano/', { plano_id: planId });
      if (!planRes.ok || !planRes.data) throw new Error("Erro plano");

      const topicIds = planRes.data.topicos || [];
      if (topicIds.length === 0) {
        toast.warning("Sem tópicos.");
        setIsGenerating(false);
        return;
      }

      let topicsData = [];
      if (typeof topicIds[0] === 'string') {
          const promises = topicIds.map(async (id: string) => {
             try {
                 const res = await apiPost('/topico/', { topico_id: id });
                 return (res.ok && res.data) ? res.data : null;
             } catch { return null; }
          });
          const results = await Promise.all(promises);
          topicsData = results.filter(Boolean);
      } else {
          topicsData = topicIds;
      }


      const fileName = sanitizeFilename(planName, "topicos");
      generateWordFromJSON(topicsData, `Tópicos - ${planName}`, fileName);

    } catch (error) {
      console.error(error);
      toast.error("Erro ao baixar.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPlan = async () => {
    if (!googleId) {
      toast.error("Erro user");
      return;
    }
    const payload = { google_id: googleId, plano_ensino_id: planId };

    try {
      toast.info("Solicitando documento...");
      const response = await download('/gerar_documentos/', payload);

      if (response.ok && response.data) {
        const blob = response.data;
        
        if (blob.type === 'application/json' || blob.type.includes('json')) {
            const text = await blob.text();
    
            const fileName = sanitizeFilename(planName, "completo");
            generateWordFromJSON(text, `Plano - ${planName}`, fileName);
            return; 
        }

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
       
        const fileName = sanitizeFilename(planName, "completo");
        link.setAttribute('download', fileName);
        
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success("Baixado!");
      } else {
        toast.error("Falha no download.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Falha na comunicação.");
    }
  };

  const busy = loading || isGenerating;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={busy}
          className={`gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary ${className}`}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
          {busy ? "Gerando..." : "Baixar Materiais"}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleDownloadPlan} className="cursor-pointer gap-2">
          <FileText className="h-4 w-4 text-blue-500" />
          <span>Plano Completo</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadTopics} className="cursor-pointer gap-2">
          <BookOpen className="h-4 w-4 text-emerald-500" />
          <span>Resumo dos Tópicos</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadActivities} className="cursor-pointer gap-2">
          <CheckSquare className="h-4 w-4 text-orange-500" />
          <span>Lista de Atividades</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}