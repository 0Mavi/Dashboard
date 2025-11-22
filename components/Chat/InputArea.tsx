'use client';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mic, ChevronRight } from 'lucide-react';
import { CreatePlanModal } from './CreatePlanModal'; 
import { useState } from "react";

// Deve corresponder exatamente à interface exportada ou utilizada no CreatePlanModal
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

interface InputAreaProps {
    placeholderText: string;
}

export function InputArea({ placeholderText }: InputAreaProps) {
    
    // O estado pode ser mantido se você desejar exibir algum feedback visual temporário,
    // mas a lógica de "Card de Confirmação" foi removida conforme solicitado.
    const [lastCreatedPlan, setLastCreatedPlan] = useState<PlanRequestPayload | null>(null);

    return (
        <div className="relative flex items-center bg-background border border-muted rounded-full py-3 px-6 shadow-lg transition duration-300 hover:shadow-xl w-full"> 
            
            {/* Botão de Adicionar Plano */}
            <div className="flex items-center space-x-1 mr-4"> 
                <CreatePlanModal 
                    onPlanCreated={(planData) => {
                        console.log("Novo plano gerado e persistido:", planData);
                        setLastCreatedPlan(planData);
                        // Aqui você pode adicionar uma notificação 'toast' se desejar
                    }}
                />
            </div>
            
            {/* Input de Texto Principal */}
            <Input
                type="text"
                placeholder={placeholderText}
                className="flex-1 border-none text-base bg-transparent px-0 py-0 placeholder:text-primary/50"
            />
            
            {/* Ícones da Direita (Enviar/Mic) */}
            <div className="flex items-center space-x-1 ml-4"> 
                <ChevronRight className="h-5 w-5 text-primary cursor-pointer hover:scale-110 transition-transform" />
                
                <Button 
                    variant="icon" 
                    size="icon" 
                    className="rounded-full h-8 w-8"
                >
                    <Mic className="h-4 w-4" />
                </Button>
            </div>
            
            {/* Observação: A lógica de renderização condicional do "Card de Confirmação" 
                foi removida. O plano é salvo automaticamente ao finalizar o modal.
            */}

        </div>
    );
}