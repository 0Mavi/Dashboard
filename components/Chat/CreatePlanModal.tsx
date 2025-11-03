'use client';


import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle"; 
import { Plus, Target, CalendarDays } from 'lucide-react';


const weekDays = [
  { day: 'Dom', full: 'Domingo' },
  { day: 'Seg', full: 'Segunda' },
  { day: 'Ter', full: 'Terça' },
  { day: 'Qua', full: 'Quarta' },
  { day: 'Qui', full: 'Quinta' },
  { day: 'Sex', full: 'Sexta' },
  { day: 'Sáb', full: 'Sábado' },
];

export function CreatePlanModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    objective: '',
    deadline: '',
    knowledgeLevel: 'beginner',
    studyDays: [] as string[], 
  });

  const handleInputChange = (field: keyof typeof formData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleStudyDay = (dayFull: string) => {
    setFormData(prev => {
      const isSelected = prev.studyDays.includes(dayFull);
      const newStudyDays = isSelected
        ? prev.studyDays.filter(d => d !== dayFull)
        : [...prev.studyDays, dayFull];
      return { ...prev, studyDays: newStudyDays };
    });
  };

  const handleSubmit = () => {
  
    if (!formData.objective || !formData.deadline || formData.studyDays.length === 0) {
        alert("Por favor, preencha o objetivo, o prazo e selecione ao menos um dia de estudo.");
        return;
    }
    
    console.log("Dados Estruturados enviados para a IAG:", formData);
    setIsOpen(false);
    
    alert("Dados enviados! A IAG está criando seu plano de estudo.");
  };

  const isSubmitDisabled = !formData.objective || !formData.deadline || formData.studyDays.length === 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} >
      <DialogTrigger asChild >
        <Button 
          variant="icon" 
          size="icon" 
          className="rounded-full h-8 w-8"
        >
          <Plus className="h-4 w-4"/>
        </Button>
      </DialogTrigger>
      
     
      <DialogContent className="sm:max-w-2xl md:max-w-4xl max-h-[90vh] overflow-y-auto border rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <Target className="h-6 w-6 text-primary" />
            <span>Criar Plano de Estudo Otimizado</span>
          </DialogTitle>
          <DialogDescription>
            Insira os detalhes para que a IAG possa gerar um cronograma personalizado e inteligente, adaptado à sua agenda.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4 grid-cols-1 md:grid-cols-2">
       
          <div className="space-y-4">
          
              <div className="space-y-1">
                  <Label htmlFor="objective">Objetivo Principal (Ex: "Aprender React e Next.js")</Label>
                  <Input 
                      id="objective" 
                      variant="formatRegisterV"
                      placeholder="O que você quer aprender?" 
                      value={formData.objective}
                      onChange={(e) => handleInputChange('objective', e.target.value)}
                  />
              </div>

              <div className="space-y-1">
                  <Label htmlFor="deadline">Prazo Final (Data do evento)</Label>
                  <Input 
                      id="deadline" 
                      type="date"
                      variant="formatRegisterV"
                      value={formData.deadline}
                      onChange={(e) => handleInputChange('deadline', e.target.value)}
                  />
              </div>


              <div className="space-y-1">
                  <Label htmlFor="knowledgeLevel">Seu Nível Atual no Assunto</Label>
                  <Select 
                      value={formData.knowledgeLevel}
                      onValueChange={(value) => handleInputChange('knowledgeLevel', value)}
                  >
                      <SelectTrigger>
                          <SelectValue placeholder="Selecione seu nível" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="beginner">Iniciante</SelectItem>
                          <SelectItem value="intermediate">Intermediário</SelectItem>
                          <SelectItem value="advanced">Avançado</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
              

              <div className="space-y-1">
                <Label htmlFor="difficulties">Principais Dificuldades/Tópicos a Focar</Label>
                <Textarea 
                  id="difficulties" 
                  rows={5}
                  placeholder="Ex: 'Tenho dificuldade em recursão' ou 'Foco em Testes Unitários'."
                />
              </div>
          </div>
          

          <div className="space-y-4">
  
              <div className="space-y-2 border p-3 rounded-lg bg-secondary/50">
                  <Label className="flex items-center space-x-2 font-semibold">
                      <CalendarDays className="h-4 w-4" />
                      <span>Quais dias da semana você pode estudar?</span>
                  </Label>
                  <p className="text-sm text-muted-foreground">Selecione os dias em que a IAG deve agendar seus blocos de estudo.</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                      {weekDays.map((day) => (
                       
                          <Toggle
                              key={day.day}
                              aria-label={`Toggle ${day.full}`}
                              onPressedChange={() => toggleStudyDay(day.full)}
                              pressed={formData.studyDays.includes(day.full)}
                              className="w-12 h-12 flex flex-col justify-center items-center text-xs p-1"
                          >
                            <span className="font-bold">{day.day}</span>
                            <span className="text-xs">
                                {formData.studyDays.includes(day.full) ? 'Ativo' : 'Inativo'}
                            </span>
                          </Toggle>
                      ))}
                  </div>
                   <p className="text-sm pt-2">
                        Dias selecionados: <span className="font-medium text-primary">{formData.studyDays.join(', ') || 'Nenhum'}</span>
                    </p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="agenda_restricao">Restrições de Agenda (Horários a Evitar)</Label>
                <Textarea 
                  id="agenda_restricao" 
                  rows={5}
                  placeholder="Ex: 'Não posso estudar antes das 18h' ou 'Terças e Quintas tenho aula das 10h às 12h'."
                />
              </div>
          </div>
          
        </div>
        
        <DialogFooter className="pt-4">
          <Button 
            type="submit" 
            onClick={handleSubmit} 
            disabled={isSubmitDisabled}
          >
            Gerar Plano com IAG
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}