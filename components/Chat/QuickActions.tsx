'use client';

// components/QuickActions.tsx
import { Button } from "@/components/ui/button";

const actions = [
  "Sugira minhas prioridades",
  "Agendar 3h de estudo",      
  "Exportar plano do dia",     
  "Criar bloco de revisão",     
  "Analisar meus padrões"      
];

export function QuickActions() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {actions.map((action, index) => (
        <Button 
          key={index}
          variant="defaultV" 
          className=""
       
        >
          {action}
        </Button>
      ))}
    </div>
  );
}