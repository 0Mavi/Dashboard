import { Gauge, Calendar, CheckCircle, Target, Clock, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// --- Dados Mockados (Simulando o Retorno da IAG e Google Calendar) ---
const mockPlanData = {
  title: "Preparação para a Prova de Estrutura de Dados",
  progress: 65, // 65% concluído
  nextStudyBlock: {
    title: "Revisão de Listas Encadeadas",
    time: "Hoje, 19:00 - 20:30",
    duration: 90, // minutos
  },
  dailyGoal: "Concluir a resolução dos 10 exercícios sobre Árvores AVL."
};

const mockMetrics = {
  studyHoursCompleted: 12,
  studyHoursGoal: 15,
  completionRate: 85, // Taxa de Conclusão de Tarefas
};

const mockAppointments = [
  { title: "Entrega do Capítulo 4 (TCC)", date: "Amanhã, 10:00", type: "Urgent" },
  { title: "Aula de Cálculo II", date: "Segunda, 14:00", type: "Normal" },
  { title: "Sincronizado com Google Calendar", date: "Última atualização: agora", type: "Sync" },
];

export default function DashboardPage() {
  const syncStatusColor = mockAppointments[2].type === 'Sync' ? 'text-green-500' : 'text-yellow-500';

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Saudação e Acesso Rápido (Top Section) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">
            Dashboard Inteligente
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo! Visão geral e próximos passos do seu planejamento.
          </p>
        </div>
        
        {/* Botão Central - Ação Principal */}
        <Link href="/chat">
          <Button  variant="home">
            <Zap className="w-5 h-5 mr-2" />
            Criar Novo Plano Personalizado (IAG)
          </Button>
        </Link>
      </div>

      {/* 2. Grid Principal: Plano Ativo e Próximos Eventos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna 1: Status do Plano de Estudo Ativo */}
        <Card className="lg:col-span-2 bg-card border-l-4 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
                <Target className="w-6 h-6 text-primary" />
                <span>Plano de Estudo Ativo</span>
            </CardTitle>
            <CardDescription className="text-lg font-semibold mt-2">
                {mockPlanData.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progresso Geral */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progresso Geral</span>
                <span>{mockPlanData.progress}% Concluído</span>
              </div>
              <Progress value={mockPlanData.progress} className="h-2" />
            </div>

            {/* Próximo Bloco */}
            <div className="p-4 bg-secondary/50 rounded-lg border">
                <p className="text-sm text-muted-foreground">Próximo Bloco de Estudo (Otimizado pela IAG):</p>
                <div className="flex items-center justify-between mt-1">
                    <span className="font-semibold text-base">{mockPlanData.nextStudyBlock.title}</span>
                    <span className="text-sm font-medium text-primary flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {mockPlanData.nextStudyBlock.time}
                    </span>
                </div>
            </div>

            {/* Meta do Dia */}
            <div className="flex items-start space-x-3 pt-2">
                <CheckCircle className="w-5 h-5 mt-1 text-green-500 flex-shrink-0" />
                <div>
                    <p className="font-semibold text-base">Meta do Dia:</p>
                    <p className="text-sm text-muted-foreground">{mockPlanData.dailyGoal}</p>
                </div>
            </div>

            <Button variant="outline" className="w-full mt-4">Ver Plano Completo</Button>
          </CardContent>
        </Card>

        {/* Coluna 2: Próximos Compromissos (Google Calendar) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Compromissos Urgentes</span>
            </CardTitle>
            <CardDescription>Sincronizado com Google Agenda.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockAppointments.map((event, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-2 last:border-b-0 last:pb-0">
                <span className={`font-medium ${event.type === 'Urgent' ? 'text-red-500' : event.type === 'Sync' ? syncStatusColor : 'text-foreground'}`}>
                    {event.title}
                </span>
                <span className="text-xs text-muted-foreground">
                    {event.date}
                </span>
              </div>
            ))}
            <Link href="/calendario">
              <Button variant="link" className="p-0 h-auto text-sm">Acessar Calendário</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* 3. Métricas de Produtividade (Bottom Row) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Métrica 1: Horas de Estudo */}
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-2xl">{mockMetrics.studyHoursCompleted}h / {mockMetrics.studyHoursGoal}h</CardTitle>
            <CardDescription className="flex items-center justify-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Horas de Estudo na Semana</span>
            </CardDescription>
          </CardHeader>
        </Card>
        
        {/* Métrica 2: Taxa de Conclusão */}
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-2xl">{mockMetrics.completionRate}%</CardTitle>
            <CardDescription className="flex items-center justify-center space-x-1">
                <CheckCircle className="w-4 h-4" />
                <span>Taxa de Conclusão de Tarefas</span>
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Métrica 3: Índice Composto de Desempenho do Agente (ICDA) */}
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-500">ICDA: 0.89</CardTitle>
            <CardDescription className="flex items-center justify-center space-x-1">
                <Gauge className="w-4 h-4" />
                <span>Desempenho do Agente IAG</span>
            </CardDescription>
          </CardHeader>
        </Card>

      </div>
    </div>
  );
}