'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Calendar, Target, AlertCircle, CheckCircle2, ChevronRight, CalendarDays, BookOpen, Layers, Loader2 } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, addHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CreatePlanModal } from '@/components/Chat/CreatePlanModal';

import { apiPost } from '@/lib/api'; 
import { toast } from 'sonner';

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

const topicCache: Record<string, any> = {};

export default function DashboardPage() {
  const [activePlan, setActivePlan] = useState<PlanResponse | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  const isFetching = useRef(false);

  const parseBackendDate = (dateStr: string) => {
    try {
      return addHours(parseISO(dateStr), 12);
    } catch {
      return new Date();
    }
  };

  const fetchTopicDetails = async (topicId: string) => {
    if (topicCache[topicId]) return topicCache[topicId];

    try {
      const res = await apiPost('/topico/', { topico_id: topicId });
      if (res.ok && res.data) {
        const data = {
          id: res.data.mongo_id || topicId,
          titulo: res.data.titulo || res.data.nome || "Tópico",
          dias: res.data.dias || []
        };
        topicCache[topicId] = data;
        return data;
      }
    } catch (e) { console.error(e); }
    return { id: topicId, titulo: "Carregando...", dias: [] };
  };

  const loadDashboardData = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);

    let gId = localStorage.getItem('google_id');
    if (!gId) {
      const uStr = localStorage.getItem('user');
      if (uStr) try { gId = JSON.parse(uStr).google_id; } catch {}
    }

    if (!gId) {
      setLoading(false);
      isFetching.current = false;
      return; 
    }

    const googleId = gId.replace(/['"]+/g, '');

    try {
      const userRes = await apiPost('/usuario/', { google_id: googleId });

      if (userRes.ok && userRes.data) {
        const planos = userRes.data.planos_estudo || [];

        if (planos.length > 0) {
          const latestPlanSummary = planos[planos.length - 1]; 
          const detailRes = await apiPost('/plano/', { plano_id: latestPlanSummary.id || latestPlanSummary._id });

          if (detailRes.ok && detailRes.data) {
            const fullPlanData = detailRes.data;

            let resolvedTopicsData: any[] = [];
            const rawTopics = fullPlanData.topicos || fullPlanData.conhecimentos_esperados || [];

            if (Array.isArray(rawTopics)) {
              if (typeof rawTopics[0] === 'string') {
                resolvedTopicsData = await Promise.all(
                  rawTopics.map((tid: string) => fetchTopicDetails(tid))
                );
              } else {
                resolvedTopicsData = rawTopics;
              }
            }

            const topicNames = resolvedTopicsData.map(t => t.titulo || "Tópico");

            setActivePlan({
              requisicao_usuario: {
                nome_evento: fullPlanData.titulo || latestPlanSummary.titulo,
                objetivo_principal: fullPlanData.objetivo || "Aprender conteúdo",
                descricao_evento: fullPlanData.descricao || "",
                data_evento: latestPlanSummary.data_evento?.split('T')[0] || "",
                dias_por_semana: fullPlanData.dias_por_semana || 0,
                conhecimentos_esperados: topicNames.slice(0, 5)
              }
            });

            const eventsList: CalendarEvent[] = [];

            if (latestPlanSummary.data_evento) {
              eventsList.push({
                id: 'exam-main',
                summary: `PROVA: ${latestPlanSummary.titulo}`,
                start: { dateTime: latestPlanSummary.data_evento },
                colorId: '11'
              });
            }

            resolvedTopicsData.forEach((topic: any, idx: number) => {
              topic.dias?.forEach((dia: string, dayIdx: number) => {
                eventsList.push({
                  id: `topic-${idx}-${dayIdx}`,
                  summary: topic.titulo || "Estudo",
                  start: { dateTime: dia },
                  colorId: '10'
                });
              });
            });

            const now = new Date();
            now.setHours(0,0,0,0);

            const futureEvents = eventsList
              .filter(e => parseBackendDate(e.start.dateTime || '') >= now)
              .sort((a, b) => 
                parseBackendDate(a.start.dateTime || '').getTime() - 
                parseBackendDate(b.start.dateTime || '').getTime()
              );

            setUpcomingEvents(futureEvents);
          }
        } else {
          setActivePlan(null);
          setUpcomingEvents([]);
        }
      }
    } catch (error) {
      console.error("Erro dashboard:", error);
      toast.error("Erro ao carregar dados.");
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
    const handleUpdate = () => { isFetching.current = false; loadDashboardData(); };
    window.addEventListener('plan-updated', handleUpdate);
    return () => window.removeEventListener('plan-updated', handleUpdate);
  }, [loadDashboardData]);

  const formatEventTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = parseBackendDate(dateStr);
    if (isToday(date)) return `Hoje, ${format(date, 'HH:mm')}`;
    if (isTomorrow(date)) return `Amanhã, ${format(date, 'HH:mm')}`;
    return format(date, "dd MMM", { locale: ptBR });
  };

  const req = activePlan?.requisicao_usuario;
  const planTopics = req?.conhecimentos_esperados || [];

  return (
    <div className="w-full h-[calc(90vh-theme(spacing.4))] p-4 md:p-6 flex flex-col gap-6 bg-background">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
            Dashboard Inteligente
            {loading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão geral do seu aprendizado e cronograma em tempo real.
          </p>
        </div>
        <CreatePlanModal onPlanCreated={loadDashboardData} />
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden flex-col lg:flex-row">

        {/* ===== PLANO ===== */}
        <Card className="flex-1 flex flex-col border-l-4 border-l-primary shadow-sm bg-card overflow-hidden">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <div className="flex justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <span className="text-lg font-semibold">Plano de Estudo Ativo</span>
                </div>
                <CardDescription className="text-base font-medium mt-1">
                  {req?.nome_evento || "Nenhum plano selecionado"}
                </CardDescription>
              </div>
              {req && <Badge variant="secondary" className='rounded-full'>Em andamento</Badge>}
            </div>
          </CardHeader>

          <CardContent className="flex-1 px-6 py-5 flex flex-col gap-4">
            

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-secondary/30 rounded-[10px] border">
                <p className="text-xs font-bold text-muted-foreground uppercase">Descrição</p>
                <p className="text-sm">{req?.descricao_evento}</p>
              </div>

              <div className="p-3 bg-secondary/30  rounded-[10px]border space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="w-4 h-4 text-primary"/>
                  <p>{req?.data_evento}</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Layers className="w-4 h-4 text-primary"/>
                  <p>{req?.dias_por_semana} dias por semana</p>
                </div>
              </div>
            </div>

            <div className="bg-background border rounded-xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 mb-3 border-b pb-2">
                <BookOpen className="text-primary w-4 h-4"/>
                <h3 className="font-bold text-sm">Tópicos de Foco</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {planTopics.map((topic, i) => (
                  <Badge key={i} variant="outline" className="bg-secondary/20 px-2 py-0.5 text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>

            <Link href="/calendar">
              <Button variant="home" className="w-full h-10 text-sm">
                <CalendarDays className="mr-2 h-4 w-4"/>
                Visualizar Cronograma Completo
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* ===== AGENDA ===== */}
        <Card className="lg:w-[400px] flex flex-col border shadow-sm bg-card overflow-hidden">
          <CardHeader className="pb-4 bg-background border-b">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Calendar className="w-5 h-5 text-primary"/>
              </div>
              Agenda IAG
            </CardTitle>
          </CardHeader>

          <ScrollArea className="flex-1 p-4 bg-muted/5">
            {upcomingEvents.map((event, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 bg-background border rounded-xl mb-2">
                
                <div className="w-7 h-7 flex items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                  {event.colorId === '11' 
                    ? <AlertCircle className="w-3.5 h-3.5"/> 
                    : <CheckCircle2 className="w-3.5 h-3.5"/>}
                </div>

                <div className="flex-1">
                  <p className="font-bold leading-tight">{event.summary}</p>
                  <Badge variant="outline" className="text-[10px] h-5 px-2 mt-1 rounded-[10px]">
                    {formatEventTime(event.start.dateTime)}
                  </Badge>
                </div>
              </div>
            ))}
          </ScrollArea>

          
        </Card>

      </div>
    </div>
  );
}
