import { useToast } from '@/hooks/use-toast';
import type { SaasAnalyticsData, AnalyticsFilters } from './useSaasAnalytics';

export const useExportSaasData = (analytics: SaasAnalyticsData | null, filters: AnalyticsFilters) => {
  const { toast } = useToast();

  // Função utilitária para converter dados em CSV
  const convertToCSV = (data: any[], headers: { [key: string]: string }) => {
    const headerRow = Object.values(headers).join(',');
    const dataRows = data.map(row => {
      return Object.keys(headers).map(key => {
        const value = row[key];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value || '';
      }).join(',');
    });
    return [headerRow, ...dataRows].join('\n');
  };

  // Função para fazer download do CSV
  const downloadCSV = (csvContent: string, filename: string) => {
    try {
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const filterSuffix = filters.company_filter ? '-empresa-especifica' : '';
      const periodSuffix = `-${filters.period_days}dias`;
      const dateSuffix = new Date().toISOString().split('T')[0];
      
      a.download = `${filename}${periodSuffix}${filterSuffix}-${dateSuffix}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Sucesso",
        description: "Relatório exportado com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao exportar relatório",
        variant: "destructive"
      });
    }
  };

  const exportOverviewData = () => {
    if (!analytics) return;
    
    const data = [
      { metric: 'Total de Empresas', value: analytics.overview.total_companies },
      { metric: 'Total de Usuários', value: analytics.overview.total_users },
      { metric: 'Empresas Ativas', value: analytics.overview.active_companies },
      { metric: 'Novos Usuários (Período)', value: analytics.overview.new_users_this_period }
    ];
    
    const headers = { metric: 'Métrica', value: 'Valor' };
    const csvContent = convertToCSV(data, headers);
    downloadCSV(csvContent, 'saas-overview');
  };

  const exportCompaniesData = () => {
    if (!analytics) return;
    
    const planData = Object.entries(analytics.companies.by_plan).map(([plan, count]) => ({
      category: 'Plano',
      type: plan,
      quantity: count
    }));
    
    const industryData = Object.entries(analytics.companies.by_industry).map(([industry, count]) => ({
      category: 'Setor',
      type: industry,
      quantity: count
    }));
    
    const sizeData = Object.entries(analytics.companies.by_size).map(([size, count]) => ({
      category: 'Tamanho',
      type: size,
      quantity: count
    }));
    
    const growthData = analytics.companies.growth.map(item => ({
      category: 'Crescimento',
      type: new Date(item.date).toLocaleDateString('pt-BR'),
      quantity: item.count
    }));
    
    const allData = [...planData, ...industryData, ...sizeData, ...growthData];
    
    const headers = { category: 'Categoria', type: 'Tipo/Data', quantity: 'Quantidade' };
    const csvContent = convertToCSV(allData, headers);
    downloadCSV(csvContent, 'empresas-analytics');
  };

  const exportUsersData = () => {
    if (!analytics) return;
    
    const roleData = Object.entries(analytics.users.by_role).map(([role, count]) => ({
      category: 'Cargo',
      type: role,
      quantity: count
    }));
    
    const growthData = analytics.users.growth.map(item => ({
      category: 'Crescimento',
      type: new Date(item.date).toLocaleDateString('pt-BR'),
      quantity: item.count
    }));
    
    const allData = [...roleData, ...growthData];
    
    const headers = { category: 'Categoria', type: 'Tipo/Data', quantity: 'Quantidade' };
    const csvContent = convertToCSV(allData, headers);
    downloadCSV(csvContent, 'usuarios-analytics');
  };

  const exportActivitiesData = () => {
    if (!analytics) return;
    
    const leadsData = Object.entries(analytics.activities.leads.by_status).map(([status, count]) => ({
      activity: 'Leads',
      status,
      quantity: count,
      total: analytics.activities.leads.total
    }));
    
    const appointmentsData = Object.entries(analytics.activities.appointments.by_status).map(([status, count]) => ({
      activity: 'Agendamentos',
      status,
      quantity: count,
      total: analytics.activities.appointments.total
    }));
    
    const meetingsData = Object.entries(analytics.activities.meetings.by_status).map(([status, count]) => ({
      activity: 'Reuniões',
      status,
      quantity: count,
      total: analytics.activities.meetings.total
    }));
    
    const tasksData = Object.entries(analytics.activities.tasks.by_status).map(([status, count]) => ({
      activity: 'Tarefas',
      status,
      quantity: count,
      total: analytics.activities.tasks.total
    }));
    
    const allData = [...leadsData, ...appointmentsData, ...meetingsData, ...tasksData];
    
    const headers = { 
      activity: 'Atividade', 
      status: 'Status', 
      quantity: 'Quantidade',
      total: 'Total da Atividade'
    };
    const csvContent = convertToCSV(allData, headers);
    downloadCSV(csvContent, 'atividades-analytics');
  };

  const exportPerformanceData = () => {
    if (!analytics) return;
    
    const headers = {
      name: 'Empresa',
      users_count: 'Usuários',
      leads_count: 'Leads',
      appointments_count: 'Agendamentos',
      activity_score: 'Pontuação'
    };
    
    const csvContent = convertToCSV(analytics.top_companies, headers);
    downloadCSV(csvContent, 'performance-empresas');
  };

  const exportCompleteReport = () => {
    if (!analytics) return;
    
    // Preparar dados do overview
    const overviewSection = [
      '=== OVERVIEW GERAL ===',
      `Total de Empresas,${analytics.overview.total_companies}`,
      `Total de Usuários,${analytics.overview.total_users}`,
      `Empresas Ativas,${analytics.overview.active_companies}`,
      `Novos Usuários (Período),${analytics.overview.new_users_this_period}`,
      '',
      '=== EMPRESAS POR PLANO ===',
      'Plano,Quantidade',
      ...Object.entries(analytics.companies.by_plan).map(([plan, count]) => `${plan},${count}`),
      '',
      '=== USUÁRIOS POR CARGO ===',
      'Cargo,Quantidade',
      ...Object.entries(analytics.users.by_role).map(([role, count]) => `${role},${count}`),
      '',
      '=== TOP EMPRESAS ===',
      'Empresa,Usuários,Leads,Agendamentos,Pontuação',
      ...analytics.top_companies.map(company => 
        `${company.name},${company.users_count},${company.leads_count},${company.appointments_count},${company.activity_score}`
      )
    ].join('\n');
    
    downloadCSV(overviewSection, 'relatorio-completo-saas');
  };

  return {
    exportOverviewData,
    exportCompaniesData,
    exportUsersData,
    exportActivitiesData,
    exportPerformanceData,
    exportCompleteReport
  };
};