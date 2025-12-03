'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Target } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { toast } from "sonner"; 

interface PlanRequestPayload {
  google_id: string;
  token: {
    access_token: string;
    refresh_token: string;
    [key: string]: any;
  };
  requisicao_usuario: {
    nome_evento: string;
    objetivo_principal: string;
    descricao_evento: string;
    data_evento: string;
    conhecimentos_esperados: string[];
    conhecimentos_previos_sobre_objetivo: string[];
    principais_dificuldades_sobre_objetivo: string[];
    dias_por_semana: number;
    dias_sem_estudo: string[];
  };
}

interface CreatePlanModalProps {
  onPlanCreated: (planData: PlanRequestPayload) => void; 
}

const parseTopics = (topicsString: string, defaultTopic: string): string[] => {
  if (!topicsString) return [defaultTopic];
  const topics = topicsString.split('\n').map(t => t.trim()).filter(t => t.length > 0);
  return topics.length > 0 ? topics : [defaultTopic];
};

export function CreatePlanModal({ onPlanCreated }: CreatePlanModalProps) {
  const { post, loading } = useApi();
  const [isOpen, setIsOpen] = useState(false);

  const [formData, setFormData] = useState({
    google_id: '',
    eventName: '',          
    objective: '',          
    description: '',        
    deadline: '',           
    previousKnowledgeTopics: '',
    difficultiesTopics: '',
    expectedKnowledgeTopics: '',
    daysPerWeek: 3,
    daysOffString: '',      
  });

  useEffect(() => {
    if (isOpen) {
      const id = localStorage.getItem('google_id');
      if (id) {
        setFormData(prev => ({ ...prev, google_id: id }));
      }
    }
  }, [isOpen]);

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const mapFormDataToApiBody = (): PlanRequestPayload => {
    const daysOffArray = formData.daysOffString
      .split(/[\n,]/)
      .map(d => d.trim())
      .filter(d => d.length > 0);

    let formattedDate = "";
    try {
        if (formData.deadline) {
            formattedDate = new Date(formData.deadline).toISOString().slice(0, 10);
        } else {
             formattedDate = new Date().toISOString().slice(0, 10);
        }
    } catch (e) {
        formattedDate = new Date().toISOString().slice(0, 10);
    }

 
    const tokenReal = 
        localStorage.getItem('access_token') || 
        localStorage.getItem('accessToken') || 
        localStorage.getItem('token') || 
        '';

    return {
      google_id: String(formData.google_id),
      
      token: {
        access_token: tokenReal,
        refresh_token: localStorage.getItem('refresh_token') || localStorage.getItem('refreshToken') || 'dummy_refresh',
        google_id: formData.google_id
      },

      requisicao_usuario: {
        nome_evento: String(formData.eventName),
        objetivo_principal: String(formData.objective),
        descricao_evento: String(formData.description || "Sem descrição"),
        data_evento: formattedDate,
        conhecimentos_esperados: parseTopics(formData.expectedKnowledgeTopics, "Concluir o cronograma proposto"),
        conhecimentos_previos_sobre_objetivo: parseTopics(formData.previousKnowledgeTopics, "Nenhum conhecimento prévio"),
        principais_dificuldades_sobre_objetivo: parseTopics(formData.difficultiesTopics, "Nenhuma dificuldade reportada"),
        dias_por_semana: Number(formData.daysPerWeek || 1),
        dias_sem_estudo: daysOffArray,
      },
    };
  };

  const handleSubmit = async () => {
    if (!formData.eventName || !formData.objective || !formData.deadline || !formData.google_id) {
      toast.warning("Preencha todos os campos obrigatórios.");
      return;
    }

    const apiBody = mapFormDataToApiBody();

  
    if (!apiBody.token.access_token || apiBody.token.access_token.length < 10) {
        console.error("Token encontrado:", apiBody.token);
        toast.error("Erro de Sessão: Token não encontrado ou inválido. Faça login novamente.");
        return;
    }

    try {
      console.log("📤 Enviando Payload:", JSON.stringify(apiBody, null, 2));
      const response = await post('/criar_plano/', apiBody);

      if (response.ok) {
        const responseData = response.data as any;
        console.log("📥 Resposta da API:", responseData); 

      
        const generatedEvents = 
            responseData?.resposta?.events || 
            responseData?.events || 
            responseData?.cronograma || 
            [];
            
        const planId = responseData?.id || responseData?.requisicao_id || Date.now().toString();

        const planToSave = {
            id: planId,
            createdAt: new Date().toISOString(),
            google_id: formData.google_id,
            token: apiBody.token,
            requisicao_usuario: { ...apiBody.requisicao_usuario },
            events: generatedEvents 
        };

     
        const historyStr = localStorage.getItem('iag_plans_history');
        const history = historyStr ? JSON.parse(historyStr) : [];
        localStorage.setItem('iag_plans_history', JSON.stringify([planToSave, ...history]));
        
    
        if (generatedEvents.length > 0) {
            localStorage.setItem('iag_calendar_events', JSON.stringify(generatedEvents));
            localStorage.setItem('iag_current_plan', JSON.stringify(planToSave));
            
         
            window.dispatchEvent(new Event('plan-updated'));
            onPlanCreated(planToSave);
            toast.success(`Sucesso! ${generatedEvents.length} eventos criados.`);
        } else {
            toast.warning("O plano foi criado, mas a IA não retornou eventos para o calendário.");
        }
        
        setIsOpen(false);
      } else {
        const msg = response.data?.message || JSON.stringify(response.data) || "Erro interno do servidor (500)";
        console.error("❌ Erro API Detalhado:", response);
        toast.error(`Falha ao criar plano: ${msg}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro de conexão. Verifique se a API está online.");
    }
  };

  const isSubmitDisabled = !formData.eventName || !formData.objective || !formData.deadline || loading;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 bg-primary/10 hover:bg-primary/20">
          <Plus className="h-4 w-4 text-primary"/>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl md:max-w-4xl max-h-[90vh] overflow-y-auto border-2 rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <Target className="h-6 w-6 text-primary" />
            <span>Novo Plano de Estudo</span>
          </DialogTitle>
          <DialogDescription>
            A IA irá gerar um cronograma com base nas suas metas.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4 grid-cols-1 md:grid-cols-2">
          {/* Esquerda */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-1">🎯 Dados do Evento</h2>
            <div className="space-y-1">
              <Label>Nome do Evento *</Label>
              <Input placeholder="Ex: Prova de Java" value={formData.eventName} onChange={(e) => handleInputChange('eventName', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Objetivo *</Label>
              <Input placeholder="Ex: Tirar nota 10" value={formData.objective} onChange={(e) => handleInputChange('objective', e.target.value)} />
            </div>
             <div className="space-y-1">
              <Label>Descrição</Label>
              <Textarea rows={2} placeholder="Detalhes extras..." value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Prazo Final *</Label>
              <Input type="date" value={formData.deadline} onChange={(e) => handleInputChange('deadline', e.target.value)} />
            </div>
            <div className="space-y-1 pt-2">
              <Label>Tópicos a Estudar</Label>
              <Textarea rows={3} placeholder="Um por linha" value={formData.expectedKnowledgeTopics} onChange={(e) => handleInputChange('expectedKnowledgeTopics', e.target.value)} />
            </div>
          </div>

          {/* Direita */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-1">🧠 Preferências</h2>
            <div className="space-y-1">
              <Label>Conhecimento Prévio</Label>
              <Textarea rows={2} placeholder="O que já sabe?" value={formData.previousKnowledgeTopics} onChange={(e) => handleInputChange('previousKnowledgeTopics', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Dificuldades</Label>
              <Textarea rows={2} placeholder="O que acha difícil?" value={formData.difficultiesTopics} onChange={(e) => handleInputChange('difficultiesTopics', e.target.value)} />
            </div>
            <div className="space-y-1 border p-3 rounded-lg bg-secondary/20">
              <Label>Frequência Semanal (Dias)</Label>
              <Input type="number" min={1} max={7} value={formData.daysPerWeek} onChange={(e) => handleInputChange('daysPerWeek', parseInt(e.target.value) || 0)} />
            </div>
            <div className="space-y-1 border p-3 rounded-lg bg-secondary/20">
              <Label>Dias sem estudo</Label>
              <Textarea rows={2} placeholder="YYYY-MM-DD (um por linha)" value={formData.daysOffString} onChange={(e) => handleInputChange('daysOffString', e.target.value)} />
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button variant="defaultV" type="submit" onClick={handleSubmit} disabled={isSubmitDisabled} className="w-full md:w-auto">
            {loading ? 'Processando...' : 'Gerar Plano'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}