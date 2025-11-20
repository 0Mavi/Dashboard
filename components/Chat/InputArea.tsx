"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mic, ChevronRight } from "lucide-react";
import { CreatePlanModal } from "./CreatePlanModal";
import { useState } from "react";

export function InputArea({ placeholderText }: { placeholderText: string }) {
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);

  return (
    <div className="relative flex items-center bg-background border rounded-full py-3 px-6 shadow-lg w-full">

      {/* BOTÃO DO MODAL */}
      <div className="mr-4">
        <CreatePlanModal
          googleId="123456789"
          onPlanCreated={(plan: any) => {
            console.log("Plano recebido no InputArea:", plan);
            setGeneratedPlan(plan);
          }}
        />
      </div>

      {/* INPUT DO CHAT */}
      <Input
        type="text"
        placeholder={placeholderText}
        className="flex-1 border-none bg-transparent px-0 py-0"
      />

      {/* BOTÕES DIREITA */}
      <div className="ml-4 flex items-center gap-1">
        <ChevronRight className="h-5 w-5 text-primary cursor-pointer" />
        <Button variant="icon" size="icon" className="rounded-full h-8 w-8">
          <Mic className="h-4 w-4" />
        </Button>
      </div>

      {/* PREVIEW DO PLANO */}
      {generatedPlan && (
        <div className="absolute top-full left-0 mt-4 w-full bg-card border rounded-lg shadow p-4">

          <h3 className="text-lg font-semibold mb-2">Plano criado pela IAG</h3>

          <p>
            <strong>Objetivo:</strong>{" "}
            {generatedPlan?.requisicao_usuario?.objetivo_principal}
          </p>

          <p>
            <strong>Data do Evento:</strong>{" "}
            {generatedPlan?.requisicao_usuario?.data_evento}
          </p>

          <div className="mt-3 flex gap-2">
            <Button variant="outline">Editar</Button>
            <Button>Confirmar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
