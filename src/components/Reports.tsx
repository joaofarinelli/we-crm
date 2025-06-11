
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Download, Calendar, ArrowUpRight, ArrowDownRight, Users, Clock } from 'lucide-react';
import { useReports } from '@/hooks/useReports';
import { useMeetingsAndAppointmentsReports, PeriodType } from '@/hooks/useMeetingsAndAppointmentsReports';
import { SalesChart } from '@/components/charts/SalesChart';
import { PipelineChart } from '@/components/charts/PipelineChart';
import { ActivitiesChart } from '@/components/charts/ActivitiesChart';
import { MeetingsReportChart } from '@/components/charts/MeetingsReportChart';
import { AppointmentsReportChart } from '@/components/charts/AppointmentsReportChart';
import { PeriodSelector } from '@/components/PeriodSelector';

export const Reports = () => {
  const { reportData, isLoading } = useReports();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('monthly');
  const { reportData: meetingsAppointmentsData, isLoading: isLoadingMeetingsAppointments } = useMeetingsAndAppointmentsReports(selectedPeriod);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const exportData = () => {
    if (!reportData || !meetingsAppointmentsData) return;
    
    const dataToExport = {
      geradoEm: new Date().toLocaleString('pt-BR'),
      periodo: selectedPeriod,
      kpis: {
        taxaConversao: reportData.conversionRate,
        ticketMedio: reportData.avgDealValue,
        leadsQualificados: reportData.qualifiedLeads,
        cicloVendas: reportData.avgSalesCycle,
        receitaTotal: reportData.totalRevenue
      },
      reunioes: {
        total: meetingsAppointmentsData.totalMeetings,
        taxaConclusao: meetingsAppointmentsData.meetingCompletionRate,
        duracaoMedia: meetingsAppointmentsData.avgMeetingDuration,
        porPeriodo: meetingsAppointmentsData.meetingsByPeriod,
        distribucaoStatus: meetingsAppointmentsData.meetingsStatusDistribution
      },
      agendamentos: {
        total: meetingsAppointmentsData.totalAppointments,
        taxaComparecimento: meetingsAppointmentsData.appointmentShowRate,
        duracaoMedia: meetingsAppointmentsData.avgAppointmentDuration,
        porPeriodo: meetingsAppointmentsData.appointmentsByPeriod,
        distribucaoStatus: meetingsAppointmentsData.appointmentsStatusDistribution
      },
      vendasPorMes: reportData.vendasPorMes,
      pipeline: reportData.pipelineData,
      leadsPorFonte: reportData.leadsBySource,
      atividadesPorMes: reportData.activitiesByMonth
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-completo-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading || isLoadingMeetingsAppointments) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-lg">Carregando relatórios...</div>
      </div>
    );
  }

  if (!reportData || !meetingsAppointmentsData) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-lg text-gray-500">Erro ao carregar dados dos relatórios</div>
      </div>
    );
  }

  const kpis = [
    { 
      label: 'Taxa de Conversão', 
      value: `${reportData.conversionRate.toFixed(1)}%`, 
      trend: formatPercentage(reportData.trendsData.conversionChange),
      trendDirection: reportData.trendsData.conversionChange >= 0 ? 'up' : 'down'
    },
    { 
      label: 'Ticket Médio', 
      value: formatCurrency(reportData.avgDealValue), 
      trend: '+R$ 1.250',
      trendDirection: 'up'
    },
    { 
      label: 'Leads Qualificados', 
      value: reportData.qualifiedLeads.toString(), 
      trend: formatPercentage(reportData.trendsData.leadsChange),
      trendDirection: reportData.trendsData.leadsChange >= 0 ? 'up' : 'down'
    },
    { 
      label: 'Ciclo de Vendas', 
      value: `${Math.round(reportData.avgSalesCycle)} dias`, 
      trend: '-1.5 dias',
      trendDirection: 'up'
    }
  ];

  const meetingsAppointmentsKpis = [
    {
      label: 'Total de Reuniões',
      value: meetingsAppointmentsData.totalMeetings.toString(),
      trend: formatPercentage(meetingsAppointmentsData.trendsData.meetingsChange),
      trendDirection: meetingsAppointmentsData.trendsData.meetingsChange >= 0 ? 'up' : 'down',
      icon: Users
    },
    {
      label: 'Taxa de Conclusão',
      value: `${meetingsAppointmentsData.meetingCompletionRate.toFixed(1)}%`,
      trend: '+2.3%',
      trendDirection: 'up',
      icon: TrendingUp
    },
    {
      label: 'Total de Agendamentos',
      value: meetingsAppointmentsData.totalAppointments.toString(),
      trend: formatPercentage(meetingsAppointmentsData.trendsData.appointmentsChange),
      trendDirection: meetingsAppointmentsData.trendsData.appointmentsChange >= 0 ? 'up' : 'down',
      icon: Calendar
    },
    {
      label: 'Taxa de Comparecimento',
      value: `${meetingsAppointmentsData.appointmentShowRate.toFixed(1)}%`,
      trend: '+1.8%',
      trendDirection: 'up',
      icon: Clock
    }
  ];

  const reports = [
    {
      title: 'Vendas por Período',
      description: 'Análise de vendas dos últimos 6 meses',
      icon: BarChart3,
      color: 'bg-blue-100 text-blue-600',
      data: reportData.salesByMonth
    },
    {
      title: 'Pipeline de Vendas',
      description: 'Distribuição de leads por status',
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600',
      data: reportData.pipelineData
    },
    {
      title: 'Atividades Mensais',
      description: 'Tarefas e agendamentos por mês',
      icon: Calendar,
      color: 'bg-purple-100 text-purple-600',
      data: reportData.activitiesByMonth
    }
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-1">Análises e métricas do seu negócio</p>
        </div>
        <div className="flex gap-4 items-center">
          <PeriodSelector 
            selectedPeriod={selectedPeriod} 
            onPeriodChange={setSelectedPeriod} 
          />
          <Button onClick={exportData} className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Exportar Dados
          </Button>
        </div>
      </div>

      {/* KPIs Principais de Vendas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <Card key={index} className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">{kpi.label}</p>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              <div className={`flex items-center justify-center gap-1 text-sm mt-1 ${
                kpi.trendDirection === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {kpi.trendDirection === 'up' ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                {kpi.trend} vs período anterior
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Seção de Relatórios de Reuniões e Agendamentos */}
      <div className="space-y-6">
        <div className="border-t pt-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Relatórios de Atendimentos e Agendamentos</h2>
          
          {/* KPIs de Reuniões e Agendamentos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {meetingsAppointmentsKpis.map((kpi, index) => {
              const Icon = kpi.icon;
              return (
                <Card key={index} className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="w-8 h-8 text-blue-600" />
                    <div className={`flex items-center gap-1 text-sm ${
                      kpi.trendDirection === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {kpi.trendDirection === 'up' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {kpi.trend}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">{kpi.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                </Card>
              );
            })}
          </div>

          {/* Gráficos de Reuniões e Agendamentos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reuniões por Período</h3>
              <MeetingsReportChart data={meetingsAppointmentsData.meetingsByPeriod} />
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Agendamentos por Período</h3>
              <AppointmentsReportChart data={meetingsAppointmentsData.appointmentsByPeriod} />
            </Card>
          </div>

          {/* Métricas Detalhadas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Reuniões - Distribuição</h3>
              <div className="space-y-2">
                {meetingsAppointmentsData.meetingsStatusDistribution.map((status, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-sm text-gray-600">{status.status}</span>
                    <span className="text-sm font-medium">{status.count} ({status.percentage.toFixed(1)}%)</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t">
                <span className="text-sm text-gray-600">Duração Média: </span>
                <span className="text-sm font-medium">{Math.round(meetingsAppointmentsData.avgMeetingDuration)} min</span>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Agendamentos - Distribuição</h3>
              <div className="space-y-2">
                {meetingsAppointmentsData.appointmentsStatusDistribution.map((status, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-sm text-gray-600">{status.status}</span>
                    <span className="text-sm font-medium">{status.count} ({status.percentage.toFixed(1)}%)</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t">
                <span className="text-sm text-gray-600">Duração Média: </span>
                <span className="text-sm font-medium">{Math.round(meetingsAppointmentsData.avgAppointmentDuration)} min</span>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Geral</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Reuniões</span>
                  <span className="text-sm font-medium">{meetingsAppointmentsData.totalMeetings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Agendamentos</span>
                  <span className="text-sm font-medium">{meetingsAppointmentsData.totalAppointments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Taxa Conclusão</span>
                  <span className="text-sm font-medium">{meetingsAppointmentsData.meetingCompletionRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Taxa Comparecimento</span>
                  <span className="text-sm font-medium">{meetingsAppointmentsData.appointmentShowRate.toFixed(1)}%</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Métricas Adicionais de Vendas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Receita Total</h3>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(reportData.totalRevenue)}</p>
          <p className="text-sm text-gray-500 mt-1">Valor total do pipeline</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Leads por Fonte</h3>
          <div className="space-y-2">
            {reportData.leadsBySource.slice(0, 3).map((source, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-sm text-gray-600">{source.source}</span>
                <span className="text-sm font-medium">{source.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Conversão</span>
              <span className="text-sm font-medium">{reportData.conversionRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Ciclo Médio</span>
              <span className="text-sm font-medium">{Math.round(reportData.avgSalesCycle)} dias</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Leads Ativos</span>
              <span className="text-sm font-medium">{reportData.qualifiedLeads}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Gráficos de Vendas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendas por Mês</h3>
          <SalesChart data={reportData.salesByMonth} />
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline de Vendas</h3>
          <PipelineChart data={reportData.pipelineData} />
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividades por Mês</h3>
        <ActivitiesChart data={reportData.activitiesByMonth} />
      </Card>

      {/* Relatórios Disponíveis */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Análises Detalhadas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reports.map((report, index) => {
            const Icon = report.icon;
            return (
              <div key={index} className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-lg ${report.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                <p className="text-gray-600 mb-4">{report.description}</p>
                <div className="text-sm text-gray-500">
                  {Array.isArray(report.data) && report.data.length > 0 
                    ? `${report.data.length} registros encontrados`
                    : 'Sem dados disponíveis'
                  }
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
