
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Target, Clock, AlertCircle, CheckCircle2, ChevronRight, CalendarDays, BookOpen, Layers } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CreatePlanModal } from '@/components/Chat/CreatePlanModal';


interface PlanResponse {
  requisicao_usuario: {
    nome_evento: string;
    objetivo_principal: string;
    descricao_evento: string;
    data_evento: string;
    conhecimentos_esperados: string[]; 
    dias_por_semana: number;
  };
}

interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  colorId?: string;
}

export default function DashboardPage() {
  const [activePlan, setActivePlan] = useState<PlanResponse | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = () => {
    try {
      const savedPlan = localStorage.getItem('iag_current_plan');
      if (savedPlan) setActivePlan(JSON.parse(savedPlan));

      const savedEvents = localStorage.getItem('iag_calendar_events');
      if (savedEvents) {
        const parsedEvents: CalendarEvent[] = JSON.parse(savedEvents);
        const now = new Date();
        now.setHours(0,0,0,0);

        const futureEvents = parsedEvents
          .filter(evt => {
            const evtDate = new Date(evt.start.dateTime || evt.start.date || '');
            return evtDate >= now;
          })
          .sort((a, b) => {
            const dateA = new Date(a.start.dateTime || a.start.date || '').getTime();
            const dateB = new Date(b.start.dateTime || b.start.date || '').getTime();
            return dateA - dateB;
          });

        setUpcomingEvents(futureEvents);
      }
    } catch (error) {
      console.error("Erro dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    window.addEventListener('plan-updated', loadDashboardData);
    return () => window.removeEventListener('plan-updated', loadDashboardData);
  }, []);

  // Helpers
  const formatEventTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = parseISO(dateStr);
    if (isToday(date)) return `Hoje, ${format(date, 'HH:mm')}`;
    if (isTomorrow(date)) return `Amanhã, ${format(date, 'HH:mm')}`;
    return format(date, "dd 'de' MMM, HH:mm", { locale: ptBR });
  };

  const getEventStyle = (colorId?: string) => {
    if (colorId === '11') return "bg-red-50 border-red-100 text-red-900";
    if (colorId === '10') return "bg-emerald-50 border-emerald-100 text-emerald-900";
    return "bg-blue-50 border-blue-100 text-blue-900";
  };

  const getIconStyle = (colorId?: string) => {
    if (colorId === '11') return "text-red-500 bg-red-100";
    if (colorId === '10') return "text-emerald-500 bg-emerald-100";
    return "text-blue-500 bg-blue-100";
  };

 
  const req = activePlan?.requisicao_usuario;
  const planName = req?.nome_evento || "Sem plano ativo";
  const planDesc = req?.descricao_evento || "";
  const planDeadline = req?.data_evento || "--/--/----";
  const planFreq = req?.dias_por_semana || 0;

  const planTopics = req?.conhecimentos_esperados && req.conhecimentos_esperados.length > 0 
    ? req.conhecimentos_esperados 
    : ["Nenhum tópico específico listado."];

  return (
    <div className="w-full h-[calc(100vh-theme(spacing.4))] p-4 md:p-6 flex flex-col gap-6 bg-background">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Dashboard Inteligente
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão geral do seu aprendizado e cronograma em tempo real.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
            <CreatePlanModal onPlanCreated={() => {}} />
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden flex-col lg:flex-row">
        

        <Card className="flex-1 flex flex-col border-l-4 border-l-primary shadow-sm bg-card overflow-hidden">
          <CardHeader className="border-b bg-muted/20 pb-4 shrink-0">
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="flex items-center space-x-2 text-xl">
                        <Target className="w-6 h-6 text-primary" />
                        <span>Plano de Estudo Ativo</span>
                    </CardTitle>
                    <CardDescription className="text-lg font-semibold mt-2 text-foreground">
                        {activePlan ? planName : "Nenhum plano selecionado"}
                    </CardDescription>
                </div>
                {activePlan && (
                    <Badge variant="secondary" className="text-xs px-3 py-1 h-fit">
                        Em andamento
                    </Badge>
                )}
            </div>
          </CardHeader>
          
  
          <CardContent className="flex-1 p-6 flex flex-col justify-between overflow-y-auto gap-6">
            {activePlan ? (
                <>
                    {/* 1. Barra de Progresso */}
                    <div className="space-y-2 shrink-0">
                        <div className="flex justify-between text-sm font-medium text-muted-foreground">
                            <span>Progresso do Cronograma</span>
                            <span>Calculado via IA</span>
                        </div>
                        <Progress value={25} className="h-3" /> 
                    </div>

                    {/* 2. Grid de Informações (Descrição e Metadados) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
                        <div className="p-4 bg-secondary/30 rounded-xl border space-y-2">
                             <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Descrição</p>
                             <p className="text-sm text-foreground leading-relaxed line-clamp-3" title={planDesc}>{planDesc}</p>
                        </div>
                        <div className="p-4 bg-secondary/30 rounded-xl border space-y-3 flex flex-col justify-center">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-background rounded-md border shadow-sm">
                                    <CalendarDays className="h-4 w-4 text-primary"/>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Prazo Final</p>
                                    <p className="text-sm font-semibold">{planDeadline}</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-background rounded-md border shadow-sm">
                                    <Layers className="h-4 w-4 text-primary"/>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Dedicação</p>
                                    <p className="text-sm font-semibold">{planFreq} dias por semana</p>
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* 3. NOVA SEÇÃO: TÓPICOS DO PLANO (Preenche o vazio!) */}
                    <div className="flex-1 min-h-[100px] bg-background border rounded-xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 border-b pb-2">
                            <BookOpen className="h-4 w-4 text-primary" />
                            <h3 className="font-bold text-sm uppercase text-foreground">Tópicos de Foco</h3>
                        </div>
                        <div className="flex flex-wrap gap-2 content-start">
                            {planTopics.map((topic, index) => (
                                <Badge key={index} variant="outline" className="px-3 py-1 text-sm font-normal bg-secondary/20 hover:bg-secondary/40 transition-colors">
                                    {topic}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* 4. Botão de Ação Inferior */}
                    <div className="pt-2 shrink-0">
                        <Link href="/calendar" className="block w-full"> 
                            <Button variant="home" className="w-full">
                                <CalendarDays className="mr-2 h-5 w-5"/>
                                Visualizar Cronograma Completo
                            </Button>
                        </Link>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-70">
                    <AlertCircle className="h-16 w-16 text-muted-foreground/50" />
                    <div>
                        <p className="text-lg font-medium">Nenhum plano encontrado</p>
                        <p className="text-sm text-muted-foreground">Crie um novo plano para começar a monitorar seu progresso.</p>
                    </div>
                </div>
            )}
          </CardContent>
        </Card>

  
        <Card className="lg:w-[400px] flex flex-col border shadow-sm bg-card h-full overflow-hidden shrink-0">
          <CardHeader className="pb-4 bg-background z-10 border-b shrink-0">
            <CardTitle className="flex items-center space-x-3 text-lg">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <span>Agenda IAG</span>
                    <p className="text-xs font-normal text-muted-foreground mt-0.5">Sincronizado com API</p>
                </div>
            </CardTitle>
          </CardHeader>
          
          <ScrollArea className="flex-1 p-4 bg-muted/5">
             <div className="space-y-3">
                {upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event, index) => {
                        const styleClass = getEventStyle(event.colorId);
                        const iconClass = getIconStyle(event.colorId);
                        
                        return (
                            <div key={index} className={`group flex items-start gap-3 p-4 rounded-2xl border transition-all hover:shadow-md bg-background ${styleClass}`}>
                              <div className={`mt-0.5 p-2 rounded-full bg-background shadow-sm shrink-0 ${iconClass}`}>
                                {event.colorId === '11' ? <AlertCircle className="w-4 h-4"/> : <CheckCircle2 className="w-4 h-4"/>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold leading-tight mb-1 truncate text-foreground/90">{event.summary}</p>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-background/50 border-current opacity-70">
                                    {formatEventTime(event.start.dateTime || event.start.date)}
                                </Badge>
                              </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-12 px-4">
                        <p className="text-sm text-muted-foreground">Nenhum evento futuro encontrado.</p>
                    </div>
                )}
             </div>
          </ScrollArea>

          <div className="p-4 bg-background border-t mt-auto shrink-0">
            <Link href="/calendar" className="w-full">
              <Button variant="outline" className="w-full justify-between group hover:bg-secondary/50">
                <span>Ver agenda completa</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </Card>

      </div>
    </div>

  );
}