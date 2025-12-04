'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Clock, BookOpen, Trash2, LayoutList, Loader2, RefreshCw } from 'lucide-react';
import { DocumentGenerator } from '@/components/Chat/DocumentGenerator';
import { CreatePlanModal } from '@/components/Chat/CreatePlanModal';
import { toast } from 'sonner';
import { useApi } from '@/hooks/useApi';

export default function PlanDisplay() {
    const [plans, setPlans] = useState<any[]>([]);
    const [googleId, setGoogleId] = useState<string>("");
    
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const isFetching = useRef(false);

    const { post, loading } = useApi(); 

    const loadLocalFallback = () => {
        const historyStr = localStorage.getItem('iag_plans_history');
        if (historyStr) {
            try { setPlans(JSON.parse(historyStr)); } catch {}
        }
    };


    const fetchPlans = useCallback(async (retryCount = 0) => {
  
        if (isFetching.current && retryCount === 0) return;
        isFetching.current = true;

        let gId = localStorage.getItem('google_id');

        if (!gId) {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const userObj = JSON.parse(userStr);
                    gId = userObj.google_id || userObj.id;
                } catch (e) { console.error(e); }
            }
        }

        if (!gId) {
            if (retryCount < 3) {
                setTimeout(() => {
                    isFetching.current = false;
                    fetchPlans(retryCount + 1);
                }, 1000);
                return;
            } else {
                console.warn("Sem ID de usuário. Carregando dados locais.");
                setIsCheckingAuth(false);
                loadLocalFallback();
                isFetching.current = false;
                return;
            }
        }

        gId = gId.replace(/['"]+/g, '');
        setGoogleId(gId);

        try {
           
            const response = await post('/usuario/', { google_id: gId });

            if (response.ok && response.data) {
                const summaryPlans = response.data.planos_estudo || [];
                
             
                const fullPlans = await Promise.all(summaryPlans.map(async (summary: any) => {
                    try {
                        const pid = summary.id || summary._id;
                        const detailRes = await post('/plano/', { plano_id: pid });
                        
                        if (detailRes.ok && detailRes.data) {
                            return { ...summary, ...detailRes.data };
                        }
                    } catch (err) {
                        console.warn(`Erro detalhe plano ${summary.id}`);
                    }
                    return summary;
                }));

                const mappedPlans = fullPlans.map((p: any) => {
                    let topicosLimpos: string[] = [];
                    const rawTopics = p.topicos || p.conhecimentos_esperados || [];

                    if (Array.isArray(rawTopics)) {
                        topicosLimpos = rawTopics.map((t: any) => {
                            if (typeof t === 'string') return t; 
                            if (typeof t === 'object' && t !== null) {
                                return t.titulo || t.nome || t.topic || "Tópico";
                            }
                            return String(t);
                        });
                    }

                    return {
                        id: p.id || p._id || p.mongo_id,
                        requisicao_usuario: {
                            nome_evento: p.titulo || "Plano sem nome",
                            data_evento: p.data_evento ? p.data_evento.split('T')[0] : "S/ Data",
                            objetivo_principal: p.objetivo || "Plano de Estudos",
                            dias_por_semana: p.dias_por_semana || 0,
                            conhecimentos_esperados: topicosLimpos, 
                            descricao_evento: p.descricao || ""
                        }
                    };
                });

                setPlans(mappedPlans);
            } else {
                loadLocalFallback();
            }
        } catch (error) {
            console.error(error);
            loadLocalFallback();
        } finally {
            setIsCheckingAuth(false);
            isFetching.current = false;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    useEffect(() => {
        fetchPlans();
        
        const handleUpdate = () => { 
            isFetching.current = false; 
            fetchPlans(); 
        };
        window.addEventListener('plan-updated', handleUpdate);
        return () => window.removeEventListener('plan-updated', handleUpdate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchPlans]); 

    const isLoading = loading || isCheckingAuth;

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
                
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => { isFetching.current = false; fetchPlans(); }} disabled={isLoading}>
                         <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                    <CreatePlanModal onPlanCreated={() => { isFetching.current = false; fetchPlans(); }} />
                </div>
            </div>

            {isLoading && plans.length === 0 ? (
                 <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 </div>
            ) : plans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/5">
                    <Target className="h-16 w-16 mb-4 opacity-20" />
                    <h3 className="text-xl font-semibold">Nenhum plano encontrado</h3>
                    <p className="max-w-sm text-center mt-2">Utilize o botão "+" acima para criar seu primeiro plano.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
                    {plans.map((plan, idx) => {
                        const req = plan.requisicao_usuario || {};
                        const topics = req.conhecimentos_esperados || [];
                        const planId = plan.id; 

                        return (
                            <Card key={planId || idx} className="flex flex-col justify-between border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all group">
                                <CardHeader className="pb-3 relative">
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="overflow-hidden">
                                            <CardTitle className="text-lg font-bold text-foreground truncate" title={req.nome_evento}>
                                                {req.nome_evento}
                                            </CardTitle>
                                            <CardDescription className="line-clamp-2 mt-1 text-xs">
                                                {req.objetivo_principal}
                                            </CardDescription>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <Badge variant="outline" className="shrink-0 text-[10px] rounded-full">
                                                {req.data_evento}
                                            </Badge>
                                        </div>
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

                                   
                                </CardContent>

                                <CardFooter className="pt-4 border-t bg-muted/5 flex justify-between items-center gap-2">
                                    <DocumentGenerator 
                                        planId={planId} 
                                        googleId={googleId}
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