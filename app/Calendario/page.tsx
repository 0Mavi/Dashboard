"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  isToday
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock,
  Filter,
  CheckCircle2
} from "lucide-react";

// Componentes Shadcn UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CreatePlanModal } from "@/components/Chat/CreatePlanModal";


// Interface de Evento
interface CalendarEvent {
  id: string | number;
  title: string;
  date: Date;
  type: 'study' | 'exam' | 'other';
  original: any;
}

// Dentro de CalendarPage.tsx

function mapEvents(apiEvents: any[]): CalendarEvent[] {
  if (!Array.isArray(apiEvents)) return [];

  return apiEvents.map((evt, idx) => {
    // Tenta encontrar a data em VÁRIOS lugares possíveis que a IA pode mandar
    const dateStr = 
      evt.start?.dateTime || 
      evt.start?.date || 
      evt.date || 
      evt.data_evento || 
      evt.data ||
      new Date().toISOString(); // Fallback para hoje se falhar
    
    let type: CalendarEvent['type'] = 'other';
    // Verifica se a IA mandou tags ou colorId
    if (evt.colorId === "11" || evt.type === 'exam' || evt.tipo === 'prova') type = 'exam'; 
    if (evt.colorId === "10" || evt.type === 'study' || evt.tipo === 'estudo') type = 'study'; 

    return {
      id: evt.id ?? idx,
      title: evt.summary || evt.title || evt.nome_evento || "Sem título",
      date: new Date(dateStr),
      type,
      original: evt
    };
  });
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const loadEvents = () => {
    try {
      const storedString = localStorage.getItem('iag_calendar_events');
      if (storedString) {
        const rawEvents = JSON.parse(storedString);
        setEvents(mapEvents(rawEvents));
      }
    } catch (e) {
      console.error("Erro ao ler eventos:", e);
    }
  };

  useEffect(() => {
    loadEvents();
    window.addEventListener('plan-updated', loadEvents);
    return () => window.removeEventListener('plan-updated', loadEvents);
  }, []);

  // --- Lógica do Calendário ---
  const daysInCalendar = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { locale: ptBR });
    const endDate = endOfWeek(monthEnd, { locale: ptBR });
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  // --- Lógica da Sidebar (Próximos Eventos) ---
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    // Define o início do dia de hoje para não excluir eventos de hoje que já passaram da hora atual
    now.setHours(0,0,0,0); 

    return events
      .filter(e => e.date >= now) // Apenas futuros ou hoje
      .sort((a, b) => a.date.getTime() - b.date.getTime()) // Ordenar por data
      .slice(0, 5); // Pegar os top 5
  }, [events]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'exam': return "destructive";
      case 'study': return "default";
      default: return "secondary";
    }
  };

  return (
    <div className="p-6 h-screen max-h-screen flex flex-col gap-6 bg-background overflow-hidden">
      
      {/* TOPO: Título e Controles */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold capitalize text-foreground flex items-center gap-2">
            <CalendarIcon className="h-6 w-6" />
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </h1>
          <div className="flex items-center rounded-md bg-card-fore gap-2">
            <Button variant="outline" onClick={prevMonth} className="rounded-full ">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="defaultV" onClick={goToToday} className="border-x px-4 font-medium">
              Hoje
            </Button>
            <Button variant="outline"  onClick={nextMonth} className="rounded-full">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <CreatePlanModal onPlanCreated={() => {}} />
      </div>

      {/* ÁREA PRINCIPAL (GRID 2 COLUNAS) */}
      <div className="flex flex-1 gap-6 overflow-hidden">
        
        {/* COLUNA 1: O CALENDÁRIO (Ocupa o máximo de espaço) */}
        <Card className="flex-1 shadow-sm border overflow-hidden flex flex-col h-full">
          
          {/* Cabeçalho Dias da Semana */}
          <div className="grid grid-cols-7 border-b bg-muted/30 shrink-0">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
              <div key={day} className="p-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
                {day}
              </div>
            ))}
          </div>

          {/* Grade de Dias (Scroll se necessário, mas tenta caber) */}
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
                  `}
                >
                  <div className="flex justify-between items-start">
                    <span 
                      className={`
                        text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full transition-all
                        ${isDayToday ? "bg-secondary text-foreground shadow-md scale-105" : "text-foreground"}
                      `}
                    >
                      {format(day, "d")}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 mt-1 overflow-hidden">
                    {dayEvents.slice(0, 3).map((evt) => (
                      <Dialog key={evt.id}>
                        <DialogTrigger asChild>
                          <div 
                            className={`
                                px-2 py-1 rounded-[4px] text-[10px] font-semibold cursor-pointer truncate border shadow-sm
                                hover:brightness-95 transition-all flex items-center gap-1.5
                                ${evt.type === 'exam' ? 'bg-red-50 text-red-700 border-red-100' : 
                                  evt.type === 'study' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                  'bg-gray-50 text-gray-700 border-gray-100'}
                            `}
                          >
                             <div className={`w-1.5 h-1.5 rounded-full shrink-0 
                                ${evt.type === 'exam' ? 'bg-red-500' : evt.type === 'study' ? 'bg-blue-500' : 'bg-gray-500'}
                             `} />
                             <span className="truncate">{evt.title}</span>
                          </div>
                        </DialogTrigger>
                        
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary"/>
                                Detalhes do Evento
                            </DialogTitle>
                            <DialogDescription>
                                {evt.title}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4 space-y-3">
                             <div className="flex items-center justify-between border-b pb-2">
                                <span className="text-sm text-muted-foreground">Data:</span>
                                <span className="font-medium">{format(evt.date, "PPPP", { locale: ptBR })}</span>
                             </div>
                             <div className="flex items-center justify-between border-b pb-2">
                                <span className="text-sm text-muted-foreground">Tipo:</span>
                                <Badge variant={getBadgeVariant(evt.type)}>
                                    {evt.type === 'exam' ? 'Avaliação' : 'Estudo'}
                                </Badge>
                             </div>
                             <div className="pt-2">
                                <span className="text-sm text-muted-foreground block mb-1">Descrição:</span>
                                <p className="text-sm bg-muted p-3 rounded-md">
                                    {evt.original?.description || "Sem descrição adicional."}
                                </p>
                             </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ))}
                    {dayEvents.length > 3 && (
                        <span className="text-[9px] text-muted-foreground pl-1 font-medium">+ {dayEvents.length - 3} mais</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* COLUNA 2: SIDEBAR (Largura Fixa - 320px) */}
        <div className="w-[300px] hidden lg:flex flex-col gap-6 shrink-0">
            
            {/* Card 1: Ações Rápidas (Decorativo/Info) */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3 text-primary mb-2">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-semibold text-sm">Status do Sistema</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Seu cronograma está sincronizado. Utilize o botão "+" acima para novos planos.
                    </p>
                </CardContent>
            </Card>

            {/* Card 2: Próximos Eventos */}
            <Card className="flex-1 flex flex-col border-t-4 border-t-primary shadow-md">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Próximos Eventos
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden">
                    <ScrollArea className="h-[calc(100vh-300px)] px-4 pb-4">
                        <div className="space-y-3 mt-2">
                            {upcomingEvents.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-xs">
                                    Nenhum evento futuro encontrado.
                                </div>
                            ) : (
                                upcomingEvents.map((evt, i) => (
                                    <div key={i} className="group flex flex-col bg-muted/30 hover:bg-muted p-3 rounded-lg transition-colors border border-transparent hover:border-border cursor-default">
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="font-semibold text-sm text-foreground line-clamp-2 leading-tight">
                                                {evt.title}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                                            <span className="font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                                                {format(evt.date, "dd MMM", { locale: ptBR })}
                                            </span>
                                            <span>
                                                {format(evt.date, "EEEE", { locale: ptBR })}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
}