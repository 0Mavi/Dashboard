"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday,
  parseISO, // Importante para ler a data corretamente
  addHours
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock,
  Loader2,
  BookOpen
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CreatePlanModal } from "@/components/Chat/CreatePlanModal";
import { apiPost } from "@/lib/api"; 
import { toast } from "sonner";

interface CalendarEvent {
  id: string | number;
  title: string;
  date: Date;
  type: 'study' | 'exam' | 'other';
  original: any;
}


const topicCache: Record<string, any> = {};

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  
  const isFetching = useRef(false);

 
  const parseBackendDate = (dateString: string) => {
    
      const date = parseISO(dateString);
      return addHours(date, 12); 
  };

 
  const fetchTopicWithCache = async (topicId: string) => {
    if (topicCache[topicId]) return topicCache[topicId];

    try {
        const res = await apiPost('/topico/', { topico_id: topicId });
        if (res.ok && res.data) {
            const data = {
                id: res.data.mongo_id || topicId,
                titulo: res.data.titulo || res.data.nome || "Tópico",
                descricao: res.data.descricao,
             
                dias: res.data.dias || [] 
            };
            topicCache[topicId] = data;
            return data;
        }
    } catch (e) {
        console.error(`Erro tópico ${topicId}`, e);
    }
    return { id: topicId, titulo: "Carregando...", dias: [] };
  };

  
  const loadData = async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);

    let gId = localStorage.getItem('google_id');
    if (!gId) {
        const uStr = localStorage.getItem('user');
        if (uStr) try { gId = JSON.parse(uStr).google_id; } catch {}
    }

    if (!gId) {
        loadLocalCache();
        setLoading(false);
        isFetching.current = false;
        return;
    }

    const googleId = gId.replace(/['"]+/g, '');

    try {
    
      const userResponse = await apiPost("/usuario/", { google_id: googleId });
      if (!userResponse.ok) throw new Error("Erro user");

      const listaPlanos = userResponse.data.planos_estudo || [];
      let todosEventos: CalendarEvent[] = [];
    
      const examEvents = listaPlanos.map((p: any) => ({
          id: p.id || p._id,
          title: `PROVA: ${p.titulo}`,
          date: p.data_evento ? parseBackendDate(p.data_evento) : new Date(),
          type: 'exam',
          original: p
      }));
      todosEventos = [...examEvents];

 
      for (const plano of listaPlanos) {
         try {
             const pid = plano.id || plano.mongo_id;
             if (!pid) continue;

             const planoRes = await apiPost("/plano/", { plano_id: pid });
             
             if (planoRes.ok && planoRes.data) {
                 const rawTopics = planoRes.data.topicos || []; 
                 
                 let resolvedTopics = [];

                 if (Array.isArray(rawTopics) && rawTopics.length > 0) {
                     if (typeof rawTopics[0] === 'string') {
                         resolvedTopics = await Promise.all(
                             rawTopics.map((tid: string) => fetchTopicWithCache(tid))
                         );
                     } else {
                         resolvedTopics = rawTopics;
                     }
                 }

           
                 
                 resolvedTopics.forEach((topic: any, idx: number) => {
               
                     if (topic.dias && Array.isArray(topic.dias) && topic.dias.length > 0) {
                         topic.dias.forEach((diaStr: string, dayIdx: number) => {
                             todosEventos.push({
                                 id: `${topic.id}-${dayIdx}`,
                                 title: topic.titulo,
                                 date: parseBackendDate(diaStr), 
                                 type: 'study',
                                 original: topic
                             });
                         });
                     } 

                     else {
                         const fallbackDate = plano.data_inicio ? parseBackendDate(plano.data_inicio) : new Date();
                         todosEventos.push({
                             id: `${topic.id}-fallback`,
                             title: `${topic.titulo} (S/ Data)`,
                             date: fallbackDate,
                             type: 'study',
                             original: topic
                         });
                     }
                 });
             }
         } catch (e) { console.warn(e); }
      }

      setEvents(todosEventos);

    } catch (error) {
      console.error(error);
      toast.error("Erro ao sincronizar.");
      loadLocalCache();
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  const loadLocalCache = () => {
      const stored = localStorage.getItem('iag_plans_history');
      if (stored) {
          try {
            const local = JSON.parse(stored);
            const mapped = local.map((p: any) => ({
                id: p.id,
                title: p.requisicao_usuario?.nome_evento || "Evento",
                date: new Date(p.requisicao_usuario?.data_evento || new Date()),
                type: 'exam',
                original: p
            }));
            setEvents(mapped);
          } catch {}
      }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Visuais ---
  const daysInCalendar = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { locale: ptBR });
    const endDate = endOfWeek(monthEnd, { locale: ptBR });
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    now.setHours(0,0,0,0); 
    return events
      .filter(e => e.date >= now)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 10);
  }, [events]);

  return (
    <div className="p-6 h-screen max-h-screen flex flex-col gap-6 bg-background overflow-hidden">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold capitalize text-foreground flex items-center gap-2">
            <CalendarIcon className="h-6 w-6" />
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-2" />}
          </h1>
          <div className="flex items-center rounded-md bg-card-fore gap-2">
            <Button variant="outline" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="rounded-full">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="default" onClick={() => setCurrentMonth(new Date())} className="border-x px-4 font-medium">
              Hoje
            </Button>
            <Button variant="outline"  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="rounded-full">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CreatePlanModal onPlanCreated={() => { isFetching.current = false; loadData(); }} />
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        <Card className="flex-1 shadow-sm border overflow-hidden flex flex-col h-full">
          <div className="grid grid-cols-7 border-b bg-muted/30 shrink-0">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
              <div key={day} className="p-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-muted/20 gap-px overflow-y-auto"> 
            {daysInCalendar.map((day) => {
              const dayEvents = events.filter(e => isSameDay(e.date, day));
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isDayToday = isToday(day);

              return (
                <div 
                  key={day.toString()} 
                  className={`
                    min-h-[80px] p-2 bg-background flex flex-col gap-1 transition-colors hover:bg-muted/5
                    ${!isCurrentMonth ? "opacity-40 bg-muted/5" : ""}
                    ${isDayToday ? "bg-primary/5" : ""}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full transition-all ${isDayToday ? "bg-primary text-primary-foreground shadow-md scale-105" : "text-foreground"}`}>
                      {format(day, "d")}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 mt-1 overflow-hidden">
                    {dayEvents.slice(0, 3).map((evt) => (
                      <Dialog key={evt.id}>
                        <DialogTrigger asChild>
                          <div className={`px-2 py-1 rounded-[4px] text-[10px] font-semibold cursor-pointer truncate border shadow-sm hover:brightness-95 transition-all flex items-center gap-1.5 
                            ${evt.type === 'exam' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                             <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${evt.type === 'exam' ? 'bg-red-500' : 'bg-blue-500'}`} />
                             <span className="truncate">{evt.title}</span>
                          </div>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-primary"/> 
                                {evt.type === 'exam' ? 'Detalhes da Prova' : 'Tópico de Estudo'}
                            </DialogTitle>
                            <DialogDescription className="text-base font-medium text-foreground">{evt.title}</DialogDescription>
                          </DialogHeader>
                          <div className="py-4 space-y-3">
                             <div className="flex items-center justify-between border-b pb-2">
                                <span className="text-sm text-muted-foreground">Data Programada:</span>
                                <span className="font-medium capitalize">{format(evt.date, "EEEE, d 'de' MMMM", { locale: ptBR })}</span>
                             </div>
                             {(evt.original?.descricao) && (
                               <div className="bg-muted p-3 rounded-md text-sm max-h-[200px] overflow-y-auto">
                                  <strong>Conteúdo:</strong> {evt.original.descricao}
                               </div>
                             )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    ))}
                    {dayEvents.length > 3 && <span className="text-[9px] text-muted-foreground pl-1 font-medium">+ {dayEvents.length - 3} mais</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="w-[300px] hidden lg:flex flex-col gap-6 shrink-0">
            <Card className="flex-1 flex flex-col border-t-4 border-t-primary shadow-md">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4" /> Próximos Estudos</CardTitle></CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden">
                    <ScrollArea className="h-[calc(100vh-200px)] px-4 pb-4">
                        <div className="space-y-3 mt-2">
                            {upcomingEvents.length === 0 ? <div className="text-center py-8 text-muted-foreground text-xs">Tudo em dia!</div> : upcomingEvents.map((evt, i) => (
                                <div key={i} className="group flex flex-col bg-muted/30 hover:bg-muted p-3 rounded-lg transition-colors border border-transparent hover:border-border cursor-default">
                                    <span className={`font-semibold text-sm line-clamp-2 ${evt.type === 'exam' ? 'text-red-600' : 'text-foreground'}`}>
                                        {evt.type === 'exam' ? '🚩 ' : ''}{evt.title}
                                    </span>
                                    <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                                        <span className="font-medium text-primary bg-primary/10 px-2 py-0.5 rounded capitalize">
                                            {format(evt.date, "EEE, dd MMM", { locale: ptBR })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}