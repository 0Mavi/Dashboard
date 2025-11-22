'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Target, CalendarDays, BookOpen, Brain, TrendingDown, Calendar as CalendarIcon } from 'lucide-react';
import { useApi } from '@/hooks/useApi';

// Interface alinhada estritamente com a estrutura necessária
interface PlanRequestPayload {
  google_id: string;
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

// Função auxiliar para transformar texto em array de strings
const parseTopics = (topicsString: string, defaultTopic: string): string[] => {
  const topics = topicsString
    .split('\n')
    .map(t => t.trim())
    .filter(t => t.length > 0);

  return topics.length > 0 ? topics : [defaultTopic];
};

export function CreatePlanModal({ onPlanCreated }: CreatePlanModalProps) {
  const { post, loading } = useApi();
  const [isOpen, setIsOpen] = useState(false);

  // Estado do formulário
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

  // Carrega o Google ID ao abrir o modal
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
    const expectedKnowledgeArray = parseTopics(formData.expectedKnowledgeTopics, "Concluir o cronograma proposto.");
    const previousKnowledgeArray = parseTopics(formData.previousKnowledgeTopics, "Nenhum conhecimento prévio declarado.");
    const difficultiesArray = parseTopics(formData.difficultiesTopics, "Nenhuma dificuldade específica declarada.");

    const daysOffArray = formData.daysOffString
      .split(/[\n,]/)
      .map(d => d.trim())
      .filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d));

    return {
      google_id: formData.google_id,
      requisicao_usuario: {
        nome_evento: formData.eventName,
        objetivo_principal: formData.objective,
        descricao_evento: formData.description,
        data_evento: formData.deadline,
        conhecimentos_esperados: expectedKnowledgeArray,
        conhecimentos_previos_sobre_objetivo: previousKnowledgeArray,
        principais_dificuldades_sobre_objetivo: difficultiesArray,
        dias_por_semana: formData.daysPerWeek,
        dias_sem_estudo: daysOffArray,
      },
    };
  };

  const handleSubmit = async () => {
    // 1. Validação básica
    if (!formData.eventName || !formData.objective || !formData.description || !formData.deadline || !formData.google_id) {
      alert("Por favor, preencha todos os campos obrigatórios (Nome, Objetivo, Descrição e Prazo).");
      return;
    }

    const apiBody = mapFormDataToApiBody();

    try {
      console.log("Enviando Requisição para API:", apiBody);
      const response = await post('/criar_plano/', apiBody);

      if (response.ok) {
        // --- SEGURANÇA DE DADOS ---
        
        // 2. Preparação dos Dados
        const generatedEvents = (response.data as any)?.resposta?.events || [];
        
        const planToSave: PlanRequestPayload = {
            google_id: formData.google_id,
            requisicao_usuario: {
                nome_evento: formData.eventName,
                objetivo_principal: formData.objective,
                descricao_evento: formData.description,
                data_evento: formData.deadline,
                conhecimentos_esperados: parseTopics(formData.expectedKnowledgeTopics, "Concluir o cronograma."),
                conhecimentos_previos_sobre_objetivo: parseTopics(formData.previousKnowledgeTopics, "Nenhum conhecimento prévio."),
                principais_dificuldades_sobre_objetivo: parseTopics(formData.difficultiesTopics, "Nenhuma dificuldade."),
                dias_por_semana: formData.daysPerWeek,
                dias_sem_estudo: apiBody.requisicao_usuario.dias_sem_estudo
            }
        };

        // 3. Log de Backup (Garantia contra falha de localStorage)
        console.log("=== BACKUP DE SEGURANÇA DOS DADOS ===");
        console.log("PLANO:", JSON.stringify(planToSave));
        console.log("EVENTOS:", JSON.stringify(generatedEvents));
        console.log("=====================================");

        try {
            // 4. Persistência com Verificação
            
            // Salva Eventos
            localStorage.setItem('iag_calendar_events', JSON.stringify(generatedEvents));
            // Verifica imediatamente se salvou
            if (!localStorage.getItem('iag_calendar_events')) {
                throw new Error("Falha crítica ao salvar eventos no armazenamento local.");
            }

            // Salva Plano
            localStorage.setItem('iag_current_plan', JSON.stringify(planToSave));
             // Verifica imediatamente se salvou
            if (!localStorage.getItem('iag_current_plan')) {
                throw new Error("Falha crítica ao salvar plano no armazenamento local.");
            }
            
            // 5. Notificação Global
            window.dispatchEvent(new Event('plan-updated'));
            
            onPlanCreated(planToSave);
            alert("Sucesso! O plano foi gerado, verificado e salvo com segurança.");
            setIsOpen(false);

        } catch (storageError) {
            console.error("ERRO CRÍTICO DE ARMAZENAMENTO:", storageError);
            alert("ATENÇÃO: O plano foi gerado pela API, mas seu navegador falhou ao salvar. Abra o Console (F12) imediatamente para copiar os dados de backup exibidos.");
            // Não fechamos o modal em caso de erro crítico para permitir que o usuário tente novamente ou copie os dados
        }

      } else {
        alert(`Erro ao processar solicitação: ${response.data?.message || 'Erro desconhecido'}`);
        console.error("Erro API:", response);
      }
    } catch (error) {
      alert("Falha de comunicação com o servidor.");
      console.error("Erro requisição:", error);
    }
  };

  const isSubmitDisabled = !formData.eventName || !formData.objective || !formData.description || !formData.deadline || loading;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="icon" size="icon" className="rounded-full h-8 w-8">
          <Plus className="h-4 w-4"/>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl md:max-w-4xl max-h-[90vh] overflow-y-auto border rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <Target className="h-6 w-6 text-primary" />
            <span>Definição de Parâmetros do Plano de Estudo</span>
          </DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para permitir que o algoritmo gere um cronograma personalizado.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4 grid-cols-1 md:grid-cols-2">
          
          {/* Coluna da Esquerda */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-1">🎯 Identificação do Evento</h2>

            <div className="space-y-1">
              <Label htmlFor="eventName">Nome do Evento <span className="text-red-500">*</span></Label>
              <Input 
                id="eventName" 
                placeholder="Ex: Preparação para Certificação Java"
                value={formData.eventName}
                onChange={(e) => handleInputChange('eventName', e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="objective">Objetivo Principal <span className="text-red-500">*</span></Label>
              <Input 
                id="objective" 
                placeholder="Ex: Ser aprovado no exame com nota superior a 80%."
                value={formData.objective}
                onChange={(e) => handleInputChange('objective', e.target.value)}
              />
            </div>

             <div className="space-y-1">
              <Label htmlFor="description">Descrição Detalhada <span className="text-red-500">*</span></Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Descreva o contexto e a motivação para este estudo."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="deadline">Data do Evento (Prazo Final) <span className="text-red-500">*</span></Label>
              <Input 
                id="deadline" 
                type="date" 
                value={formData.deadline}
                onChange={(e) => handleInputChange('deadline', e.target.value)}
              />
            </div>

            <div className="space-y-1 pt-2">
              <Label htmlFor="expectedKnowledgeTopics" className='flex items-center space-x-1'>
                <BookOpen className='h-4 w-4'/>
                <span>Conhecimentos Esperados (Tópicos)</span>
              </Label>
              <Textarea
                id="expectedKnowledgeTopics"
                rows={4}
                placeholder="Liste os tópicos que deseja dominar, separados por linha."
                value={formData.expectedKnowledgeTopics}
                onChange={(e) => handleInputChange('expectedKnowledgeTopics', e.target.value)}
              />
            </div>
          </div>

          {/* Coluna da Direita */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-1">🧠 Contexto e Restrições</h2>

            <div className="space-y-1">
              <Label htmlFor="previousKnowledgeTopics" className='flex items-center space-x-1'>
                <Brain className='h-4 w-4'/>
                <span>Conhecimentos Prévios</span>
              </Label>
              <Textarea
                id="previousKnowledgeTopics"
                rows={3}
                placeholder="O que você já sabe sobre o assunto? (Um por linha)"
                value={formData.previousKnowledgeTopics}
                onChange={(e) => handleInputChange('previousKnowledgeTopics', e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="difficultiesTopics" className='flex items-center space-x-1'>
                <TrendingDown className='h-4 w-4'/>
                <span>Principais Dificuldades</span>
              </Label>
              <Textarea
                id="difficultiesTopics"
                rows={3}
                placeholder="Quais conceitos você considera mais difíceis? (Um por linha)"
                value={formData.difficultiesTopics}
                onChange={(e) => handleInputChange('difficultiesTopics', e.target.value)}
              />
            </div>

            <div className="space-y-1 border p-3 rounded-lg bg-secondary/20">
              <Label className="flex items-center space-x-2 font-semibold" htmlFor='daysPerWeek'>
                <CalendarDays className="h-4 w-4" />
                <span>Frequência Semanal (Dias)</span>
              </Label>
              <Input
                id="daysPerWeek"
                type="number"
                min={1}
                max={7}
                value={formData.daysPerWeek}
                onChange={(e) => handleInputChange('daysPerWeek', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-1 border p-3 rounded-lg bg-secondary/20">
              <Label htmlFor="daysOffString" className='flex items-center space-x-2 font-semibold'>
                <CalendarIcon className='h-4 w-4'/>
                <span>Datas Indisponíveis (YYYY-MM-DD)</span>
              </Label>
              <Textarea
                id="daysOffString"
                rows={4}
                placeholder="Ex: &#10;2025-12-25&#10;2026-01-01"
                value={formData.daysOffString}
                onChange={(e) => handleInputChange('daysOffString', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Insira uma data por linha no formato Ano-Mês-Dia.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="w-full md:w-auto"
          >
            {loading ? 'Processando e Salvando...' : 'Gerar Plano de Estudo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}