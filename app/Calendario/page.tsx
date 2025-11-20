"use client";

import React, { useState, useMemo } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

import "./calendar.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "pt-BR": ptBR };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: any) => startOfWeek(date, { locale: ptBR }),
  getDay,
  locales,
});

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ↪️ converte eventos da API pro formato do react-big-calendar
function mapApiEventsToCalendar(apiEvents: any[]) {
  return apiEvents.map((evt: any, index: number) => {
    const startDateStr =
      evt.start?.dateTime ||
      evt.start?.date ||
      evt.start?.additionalProp1;

    const endDateStr =
      evt.end?.dateTime ||
      evt.end?.date ||
      evt.end?.additionalProp1 ||
      startDateStr;

    return {
      id: evt.id ?? index,
      title: evt.summary,
      start: new Date(startDateStr),
      end: new Date(endDateStr),
      status: evt.status,
      colorId: evt.colorId,
    };
  });
}

interface CustomToolbarProps {
  label: string;
  onView: (view: string) => void;
  onNavigate: (action: "PREV" | "NEXT" | "TODAY", newDate?: Date) => void;
  view: string;
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
}

const CustomToolbar = ({
  label,
  onView,
  onNavigate,
  view,
  setDate,
}: CustomToolbarProps) => {
  const views = ["month", "week", "day"];

  const goToToday = () => {
    const today = new Date();
    setDate(today);
    onNavigate("TODAY", today);
  };

  return (
    <div className="flex justify-between items-center p-2 mb-4  border-b border-border">
      <div className="flex items-center space-x-2">
        <Button variant="outline" onClick={goToToday}>
          Hoje
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate("PREV")}
          className="h-8 w-8 rounded-full"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate("NEXT")}
          className="h-8 w-8 rounded-full"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <span className="text-xl font-semibold ml-4">{label}</span>
      </div>

      <div className="flex space-x-2">
        {views.map((viewName) => (
          <Button
            key={viewName}
            variant={view === viewName ? "defaultV" : "outline"}
            onClick={() => onView(viewName)}
            className="capitalize"
          >
            {viewName === "month"
              ? "Mês"
              : viewName === "week"
              ? "Semana"
              : "Dia"}
          </Button>
        ))}
      </div>
    </div>
  );
};

const mockUpcomingEvents = [
  { title: "Reunião de Orientação", time: "Hoje, 16:00" },
  { title: "Estudo: Estrutura de Dados (IAG)", time: "Amanhã, 10:00" },
  { title: "Revisão Espaçada (IAG)", time: "Sex, 14:00" },
];

export default function CalendarPage() {
  const [date, setDate] = useState(new Date());

  // eventos que vão pro calendário
  const [events, setEvents] = useState<any[]>([]);
  // dias sem estudo, pra pintar o fundo
  const [diasSemEstudo, setDiasSemEstudo] = useState<string[]>([]);

  const { messages, formats } = useMemo(
    () => ({
      messages: {
        next: "Próximo",
        previous: "Anterior",
        today: "Hoje",
        month: "Mês",
        week: "Semana",
        day: "Dia",
      },
      formats: {
        dayFormat: (d: Date, culture: string, localizer: any) =>
          localizer.format(d, "EEE dd/MM", culture),
        timeGutterFormat: "HH:mm",
      },
    }),
    []
  );

  // estiliza os eventos (cor, borda, etc.)
  const eventPropGetter = (event: any) => {
    let backgroundColor = "#6366f1"; // padrão

    if (event.status === "cancelled") backgroundColor = "#ef4444";
    if (event.status === "done") backgroundColor = "#22c55e";

    return {
      style: {
        backgroundColor,
        borderRadius: "8px",
        color: "white",
        border: "none",
      },
    };
  };

  // pinta os dias sem estudo
  const dayPropGetter = (d: Date) => {
    const iso = d.toISOString().slice(0, 10); // "YYYY-MM-DD"
    if (diasSemEstudo.includes(iso)) {
      return {
        style: {
          backgroundColor: "rgba(248, 113, 113, 0.12)", // vermelhinho claro
        },
      };
    }
    return {};
  };

  // 🔥 chama o backend /agendar_plano/ e joga os eventos no calendário
  const handleCreatePlan = async () => {
    const accessToken = localStorage.getItem("access_token");

    if (!API_URL) {
      console.error("NEXT_PUBLIC_API_URL não definido");
      return;
    }

    if (!accessToken) {
      console.error("Sem access_token no localStorage");
      return;
    }

    // aqui é um exemplo de body; depois você pode ligar num formulário
    const body = {
      token: {
        access_token: accessToken,
      },
      requisicao: {
        nome_evento: "Plano de Estudos IAG",
        objetivo_principal: "Aprovar em Estrutura de Dados",
        descricao_evento: "Plano gerado automaticamente pelo IAG",
        data_evento: "2025-11-19",
        conhecimentos_esperados: ["Listas ligadas", "Filas", "Pilhas"],
        conhecimentos_previos_sobre_objetivo: ["Lógica de programação"],
        principais_dificuldades_sobre_objetivo: [
          "Complexidade",
          "Recursão",
        ],
        dias_por_semana: 4,
        dias_sem_estudo: ["2025-11-20", "2025-11-24"],
      },
      // se a API não exigir lista_eventos no body, pode remover essa parte
      lista_eventos: {
        events: [],
      },
    };

    try {
      const res = await fetch(`${API_URL}/agendar_plano/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        console.error("Erro ao agendar plano:", res.status);
        const errText = await res.text();
        console.error(errText);
        return;
      }

      const data = await res.json();

      // eventos retornados pela API
      const mappedEvents = mapApiEventsToCalendar(
        data.lista_eventos?.events ?? []
      );
      setEvents(mappedEvents);

      // dias sem estudo vindos da requisição/resposta
      if (data.requisicao?.dias_sem_estudo) {
        setDiasSemEstudo(data.requisicao.dias_sem_estudo);
      } else if (body.requisicao.dias_sem_estudo) {
        // fallback: usa os mesmos que mandamos
        setDiasSemEstudo(body.requisicao.dias_sem_estudo);
      }
    } catch (e) {
      console.error("Erro ao criar plano/eventos:", e);
    }
  };

  return (
    <div className="p-4 md:p-8 flex-1 grid lg:grid-cols-[1fr_280px] gap-6 ">
      <div className="min-h-[80vh] flex flex-col">
        <Card className="flex-1 p-2">
          <CardContent className="h-full p-0">
            <Calendar
              localizer={localizer}
              events={events} // 👈 vem da API
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              messages={messages}
              components={{
                toolbar: (toolbarProps: any) => (
                  <CustomToolbar
                    {...toolbarProps}
                    date={date}
                    setDate={setDate}
                  />
                ),
              }}
              defaultView="month"
              date={date}
              onNavigate={setDate}
              views={["month", "week", "day"]}
              eventPropGetter={eventPropGetter}
              dayPropGetter={dayPropGetter}
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="h-fit p-4 sticky top-4">
          <Button
            className="w-full mb-4 flex items-center justify-center"
            variant="outline"
            onClick={handleCreatePlan}
          >
            <Plus className="h-5 w-5 mr-2" />
            Criar Novo Evento/Plano
          </Button>

          <h3 className="font-semibold mb-2 mt-4 text-foreground">
            Minhas Agendas
          </h3>
          <div className="space-y-3 text-sm text-foreground">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="agenda-iag"
                defaultChecked
                className="data-[state=checked]:bg-secondary data-[state=checked]:text-foreground border-secondary rounded-full h-5 w-5"
              />
              <label
                htmlFor="agenda-iag"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Planos IAG
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="agenda-google"
                defaultChecked
                className="data-[state=checked]:bg-secondary data-[state=checked]:text-foreground border-secondary rounded-full h-5 w-5"
              />
              <label
                htmlFor="agenda-google"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Google Calendar
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="agenda-tarefas"
                defaultChecked
                className="data-[state=checked]:bg-secondary data-[state=checked]:text-foreground border-secondary rounded-full h-5 w-5"
              />
              <label
                htmlFor="agenda-tarefas"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Tarefas
              </label>
            </div>
          </div>
        </Card>

        <Card className="h-fit p-4">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <span>Próximos Eventos</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-0 pt-3">
            {mockUpcomingEvents.map((event, index) => (
              <div key={index} className="border-l-4 border-primary/50 pl-3">
                <p className="font-semibold text-sm">{event.title}</p>
                <p className="text-xs text-muted-foreground">{event.time}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
