'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Target, Clock, ListChecks, ChevronRight, CalendarDays } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interface do Plano (Metadados)
interface PlanResponse {
    google_id: string;
    requisicao_usuario?: { 
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

// Interface para os Eventos (Agendamentos)
interface CalendarEvent {
    summary: string;
    start: { dateTime?: string; date?: string };
    end: { dateTime?: string; date?: string };
    status?: string;
}

export default function PlanDisplay() {
    const [currentPlan, setCurrentPlan] = useState<PlanResponse | null>(null);
    const [events, setEvents] = useState<CalendarEvent[]>([]);

    // Função para carregar dados do LocalStorage
    const loadDataFromStorage = () => {
        // 1. Carrega o Plano
        const savedPlan = localStorage.getItem('iag_current_plan');
        if (savedPlan) {
            try {
                setCurrentPlan(JSON.parse(savedPlan));
            } catch (e) {
                console.error("Erro ao ler plano:", e);
            }
        }

        // 2. Carrega os Eventos Gerados
        const savedEvents = localStorage.getItem('iag_calendar_events');
        if (savedEvents) {
            try {
                const parsedEvents = JSON.parse(savedEvents);
                // Ordena por data
                const sortedEvents = Array.isArray(parsedEvents) 
                    ? parsedEvents.sort((a: any, b: any) => {
                        const dateA = new Date(a.start?.dateTime || a.start?.date || 0).getTime();
                        const dateB = new Date(b.start?.dateTime || b.start?.date || 0).getTime();
                        return dateA - dateB;
                    })
                    : [];
                setEvents(sortedEvents);
            } catch (e) {
                console.error("Erro ao ler eventos:", e);
            }
        }
    };

    useEffect(() => {
        loadDataFromStorage();
        window.addEventListener('plan-updated', loadDataFromStorage);
        return () => {
            window.removeEventListener('plan-updated', loadDataFromStorage);
        };
    }, []);

    // Helper para formatar data do evento
    const formatEventDate = (dateString?: string) => {
        if (!dateString) return 'Data desconhecida';
        try {
            const date = parseISO(dateString);
            return format(date, "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
        } catch {
            return dateString;
        }
    };

    if (!currentPlan) {
        return (
            <Card className="w-full bg-muted/50 border-dashed border-2">
                <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground text-sm">
                    <Target className="h-10 w-10 mb-2 opacity-20" />
                    <p>Nenhum plano de estudos ativo no momento.</p>
                    <p>Utilize a barra de criação para começar.</p>
                </CardContent>
            </Card>
        );
    }

    const req = currentPlan.requisicao_usuario;
    const nome = req?.nome_evento || 'Evento sem título';
    const objetivo = req?.objetivo_principal || 'Objetivo não especificado';
    const dataAlvo = req?.data_evento || 'Sem data definida';
    const descricao = req?.descricao_evento || 'Detalhes não disponíveis.';
    const diasSemana = req?.dias_por_semana || 0;

    return (
        <div className="w-full mb-6">
            <Dialog>
                {/* O Trigger envolve o Card inteiro, tornando-o clicável */}
                <DialogTrigger asChild>
                    <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group relative">
                        {/* Dica visual de que é clicável */}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground">
                            <span className="text-xs mr-1">Ver cronograma</span>
                            <ChevronRight className="inline h-4 w-4" />
                        </div>

                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-xl text-primary flex items-center gap-2">
                                        <Target className="h-5 w-5" />
                                        {nome}
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-base line-clamp-1">
                                        {objetivo}
                                    </CardDescription>
                                </div>
                                <Badge variant="outline" className="flex items-center gap-1 py-1 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <Calendar className="h-3 w-3" />
                                    Prazo: {dataAlvo}
                                </Badge>
                            </div>
                        </CardHeader>
                        
                        <CardContent>
                            <div className="grid gap-4">
                                <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md line-clamp-2">
                                    <span className="font-semibold text-foreground">Descrição: </span> 
                                    {descricao}
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <Clock className="h-4 w-4 text-primary" />
                                        <span className="font-medium text-foreground">{diasSemana}</span> dias/semana
                                    </div>
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <ListChecks className="h-4 w-4 text-primary" />
                                        <span className="font-medium text-foreground">{events.length}</span> sessões agendadas
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </DialogTrigger>

                {/* Conteúdo do Modal (Resumo do Cronograma) */}
                <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CalendarDays className="h-6 w-6 text-primary"/>
                            Cronograma Detalhado
                        </DialogTitle>
                        <DialogDescription>
                            Visualização de todas as sessões de estudo geradas para <strong>{nome}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden mt-4">
                        {events.length > 0 ? (
                            <ScrollArea className="h-[50vh] pr-4">
                                <div className="space-y-4">
                                    {events.map((evt, index) => (
                                        <div key={index} className="flex gap-4 border-b pb-3 last:border-0">
                                            <div className="flex flex-col items-center justify-center min-w-[60px] h-[60px] bg-muted/50 rounded-lg border text-center p-1">
                                                <span className="text-xs font-bold uppercase text-muted-foreground">
                                                    {evt.start?.dateTime 
                                                        ? format(parseISO(evt.start.dateTime), 'MMM', { locale: ptBR }) 
                                                        : '---'}
                                                </span>
                                                <span className="text-xl font-bold text-primary">
                                                     {evt.start?.dateTime 
                                                        ? format(parseISO(evt.start.dateTime), 'dd') 
                                                        : '?'}
                                                </span>
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <h4 className="font-semibold text-sm">{evt.summary}</h4>
                                                <p className="text-xs text-muted-foreground capitalize">
                                                    {formatEventDate(evt.start?.dateTime || evt.start?.date)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground border-2 border-dashed rounded-xl">
                                <ListChecks className="h-8 w-8 mb-2 opacity-20" />
                                <p>Nenhum agendamento encontrado para este plano.</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}