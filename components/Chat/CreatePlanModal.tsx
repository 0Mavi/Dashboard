"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { Plus, Target, CalendarDays } from "lucide-react";
import { useApi } from "@/hooks/useApi";

const weekDays = [
  { day: "Dom", full: "Domingo" },
  { day: "Seg", full: "Segunda" },
  { day: "Ter", full: "Terça" },
  { day: "Qua", full: "Quarta" },
  { day: "Qui", full: "Quinta" },
  { day: "Sex", full: "Sexta" },
  { day: "Sáb", full: "Sábado" },
];

export interface CreatePlanModalProps {
  googleId: string;
  onPlanCreated?: (plan: any) => void;
}

type FormState = {
  objective: string;
  deadline: string;
  knowledgeLevel: "beginner" | "intermediate" | "advanced";
  studyDays: string[];
  difficulties: string;
  agendaRestrictions: string;
};

export function CreatePlanModal({
  googleId,
  onPlanCreated,
}: CreatePlanModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [formData, setFormData] = useState<FormState>({
    objective: "",
    deadline: "",
    knowledgeLevel: "beginner",
    studyDays: [],
    difficulties: "",
    agendaRestrictions: "",
  });

  const { post, loading } = useApi();

  const handleInputChange = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleStudyDay = (dayFull: string) => {
    setFormData((prev) => {
      const isSelected = prev.studyDays.includes(dayFull);
      const newStudyDays = isSelected
        ? prev.studyDays.filter((d) => d !== dayFull)
        : [...prev.studyDays, dayFull];

      return { ...prev, studyDays: newStudyDays };
    });
  };

  const handleSubmit = async () => {
    if (
      !formData.objective ||
      !formData.deadline ||
      formData.studyDays.length === 0
    ) {
      alert(
        "Por favor, preencha o objetivo, o prazo e selecione ao menos um dia de estudo."
      );
      return;
    }

    const dificuldadesArray = formData.difficulties
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const payload = {
      google_id: googleId,
      requisicao_usuario: {
        nome_evento: `Plano de estudo - ${formData.objective}`,
        objetivo_principal: formData.objective,
        descricao_evento: `Nível atual: ${formData.knowledgeLevel}. Dias: ${formData.studyDays.join(
          ", "
        )}. ${
          formData.agendaRestrictions
            ? `Restrições: ${formData.agendaRestrictions}`
            : ""
        }`,
        data_evento: formData.deadline,
        conhecimentos_esperados: [],
        conhecimentos_previos_sobre_objetivo: [],
        principais_dificuldades_sobre_objetivo: dificuldadesArray,
      },
      dias_por_semana: formData.studyDays.length,
      dias_sem_estudo: [],
    };

    try {
      const res = await post("/criar_plano/", payload);

      if (res.ok && res.data?.sucesso) {
        if (onPlanCreated) onPlanCreated(res.data.resposta);

        alert("Plano criado com sucesso!");
        setIsOpen(false);
      } else {
        alert(res.data?.erro?.mensagem || "Erro ao criar plano.");
      }
    } catch (err) {
      alert("Erro ao se comunicar com o servidor.");
      console.error(err);
    }
  };

  const isSubmitDisabled =
    !formData.objective ||
    !formData.deadline ||
    formData.studyDays.length === 0 ||
    loading;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="icon" size="icon" className="rounded-full h-8 w-8">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl md:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <Target className="h-6 w-6 text-primary" />
            <span>Criar Plano de Estudo Otimizado</span>
          </DialogTitle>
          <DialogDescription>
            Preencha os dados para que a IA gere um plano personalizado.
          </DialogDescription>
        </DialogHeader>

        {/* FORM */}
        <div className="grid gap-6 py-4 grid-cols-1 md:grid-cols-2">
          {/* ESQUERDA */}
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Objetivo Principal</Label>
              <Input
                placeholder="Ex: Aprender React"
                value={formData.objective}
                onChange={(e) =>
                  handleInputChange("objective", e.target.value)
                }
              />
            </div>

            <div className="space-y-1">
              <Label>Prazo Final</Label>
              <Input
                type="date"
                value={formData.deadline}
                onChange={(e) => handleInputChange("deadline", e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label>Nível Atual</Label>
              <Select
                value={formData.knowledgeLevel}
                onValueChange={(v) =>
                  handleInputChange(
                    "knowledgeLevel",
                    v as FormState["knowledgeLevel"]
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Iniciante</SelectItem>
                  <SelectItem value="intermediate">Intermediário</SelectItem>
                  <SelectItem value="advanced">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Dificuldades</Label>
              <Textarea
                rows={5}
                placeholder="Uma dificuldade por linha"
                value={formData.difficulties}
                onChange={(e) =>
                  handleInputChange("difficulties", e.target.value)
                }
              />
            </div>
          </div>

          {/* DIREITA */}
          <div className="space-y-4">
            <div className="space-y-2 border p-3 rounded-lg bg-secondary/50">
              <Label className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-2" />
                Dias para estudar
              </Label>

              <div className="flex flex-wrap gap-2">
                {weekDays.map((d) => (
                  <Toggle
                    key={d.day}
                    onPressedChange={() => toggleStudyDay(d.full)}
                    pressed={formData.studyDays.includes(d.full)}
                    className="w-12 h-12 flex flex-col justify-center items-center text-xs"
                  >
                    <span>{d.day}</span>
                    <span className="text-[10px]">
                      {formData.studyDays.includes(d.full)
                        ? "Ativo"
                        : "Inativo"}
                    </span>
                  </Toggle>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <Label>Restrições de Agenda</Label>
              <Textarea
                rows={5}
                placeholder="Ex: Não posso antes das 18h"
                value={formData.agendaRestrictions}
                onChange={(e) =>
                  handleInputChange("agendaRestrictions", e.target.value)
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button onClick={handleSubmit} disabled={isSubmitDisabled}>
            {loading ? "Enviando..." : "Gerar Plano"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
