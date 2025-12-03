'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Clock, BookOpen, Trash2, LayoutList } from 'lucide-react';
import { DocumentGenerator } from '@/components/Chat/DocumentGenerator';
import { CreatePlanModal } from '@/components/Chat/CreatePlanModal';

export default function PlanDisplay() {
    const [plans, setPlans] = useState<any[]>([]);

    const loadData = () => {
        try {
          
            const historyStr = localStorage.getItem('iag_plans_history');
            if (historyStr) {
                setPlans(JSON.parse(historyStr));
            } else {
         
                const currentStr = localStorage.getItem('iag_current_plan');
                if (currentStr) setPlans([JSON.parse(currentStr)]);
            }
        } catch (e) {
            console.error("Erro ao ler planos:", e);
        }
    };

    useEffect(() => {
        loadData();
    
        window.addEventListener('plan-updated', loadData);
        return () => window.removeEventListener('plan-updated', loadData);
    }, []);

    const handleDelete = (id: string) => {
        if(!confirm("Tem certeza que deseja remover este plano do histórico?")) return;
        
        const newPlans = plans.filter(p => p.id !== id);
        setPlans(newPlans);
        localStorage.setItem('iag_plans_history', JSON.stringify(newPlans));
    };

    return (
        <div className="flex flex-col h-full w-full bg-background p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-8 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <LayoutList className="h-8 w-8" />
                        Planos de Estudo
                    </h1>
                    <p className="text-muted-foreground mt-1">Gerencie seus cronogramas e gere materiais didáticos.</p>
                </div>
                
           
                <CreatePlanModal onPlanCreated={() => {}} />
            </div>

            {plans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/5">
                    <Target className="h-16 w-16 mb-4 opacity-20" />
                    <h3 className="text-xl font-semibold">Nenhum plano encontrado</h3>
                    <p className="max-w-sm text-center mt-2">Utilize o botão "+" acima para criar seu primeiro plano de estudos com Inteligência Artificial.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
                    {plans.map((plan, idx) => {
                        const req = plan.requisicao_usuario || {};
                        const topics = req.conhecimentos_esperados || [];
                  
                        const planId = plan.id || plan.google_id; 

                        return (
                            <Card key={idx} className="flex flex-col justify-between border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all group">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="overflow-hidden">
                                            <CardTitle className="text-lg font-bold text-foreground truncate" title={req.nome_evento}>
                                                {req.nome_evento || "Sem título"}
                                            </CardTitle>
                                            <CardDescription className="line-clamp-2 mt-1 text-xs">
                                                {req.objetivo_principal}
                                            </CardDescription>
                                        </div>
                                        <Badge variant="outline" className="shrink-0 text-[10px] rounded-full">
                                            {req.data_evento}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                
                                <CardContent className="space-y-4 flex-1">
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground bg-secondary/20 p-2 rounded-lg">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3 text-primary" /> {req.dias_por_semana} dias/sem
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <BookOpen className="h-3 w-3 text-primary" /> {topics.length} Tópicos
                                        </span>
                                    </div>
                                    
                                    {req.descricao_evento && (
                                        <p className="text-xs text-muted-foreground line-clamp-3 italic">
                                            "{req.descricao_evento}"
                                        </p>
                                    )}

                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {topics.slice(0, 3).map((t: string, i: number) => (
                                            <span key={i} className="text-[10px] px-2 py-0.5 bg-muted rounded text-muted-foreground border truncate max-w-[100px]">
                                                {t}
                                            </span>
                                        ))}
                                        {topics.length > 3 && <span className="text-[10px] text-muted-foreground px-1">+{topics.length - 3}</span>}
                                    </div>
                                </CardContent>

                                <CardFooter className="pt-4 border-t bg-muted/5 flex justify-between items-center gap-2">
                                   

                            
                                    <DocumentGenerator 
                                        planId={planId} 
                                        topics={topics} 
                                        className="w-full rounded-full"
                                    />
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}