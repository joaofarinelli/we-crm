import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, BarChart3, Users, Building2, Activity, TrendingUp, Download } from 'lucide-react';
import { useExportSaasData } from '@/hooks/useExportSaasData';
import type { SaasAnalyticsData, AnalyticsFilters } from '@/hooks/useSaasAnalytics';

interface ExportSaasDataSectionProps {
  analytics: SaasAnalyticsData | null;
  filters: AnalyticsFilters;
}

export const ExportSaasDataSection = ({ analytics, filters }: ExportSaasDataSectionProps) => {
  const {
    exportOverviewData,
    exportCompaniesData,
    exportUsersData,
    exportActivitiesData,
    exportPerformanceData,
    exportCompleteReport
  } = useExportSaasData(analytics, filters);

  const exportOptions = [
    {
      title: 'Overview Geral',
      description: 'Métricas principais e indicadores gerais do sistema',
      icon: BarChart3,
      color: 'text-blue-600',
      action: exportOverviewData
    },
    {
      title: 'Dados de Empresas',
      description: 'Distribuição por plano, setor, tamanho e crescimento',
      icon: Building2,
      color: 'text-green-600',
      action: exportCompaniesData
    },
    {
      title: 'Dados de Usuários',
      description: 'Distribuição por cargo e crescimento de usuários',
      icon: Users,
      color: 'text-purple-600',
      action: exportUsersData
    },
    {
      title: 'Atividades do Sistema',
      description: 'Leads, agendamentos, reuniões e tarefas por status',
      icon: Activity,
      color: 'text-orange-600',
      action: exportActivitiesData
    },
    {
      title: 'Performance de Empresas',
      description: 'Top empresas por pontuação de atividade',
      icon: TrendingUp,
      color: 'text-red-600',
      action: exportPerformanceData
    },
    {
      title: 'Relatório Completo',
      description: 'Todos os dados consolidados em um único arquivo',
      icon: Download,
      color: 'text-indigo-600',
      action: exportCompleteReport
    }
  ];

  if (!analytics) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-lg text-muted-foreground">
          Carregue os dados de analytics para habilitar as exportações
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Exportar Relatórios</h2>
        <p className="text-muted-foreground mt-2">
          Baixe dados em formato CSV para análises externas
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {exportOptions.map((option, index) => {
          const IconComponent = option.icon;
          
          return (
            <Card key={index} className="transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted`}>
                    <IconComponent className={`h-5 w-5 ${option.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{option.title}</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-sm">
                  {option.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  onClick={option.action}
                  variant="outline" 
                  size="sm"
                  className="w-full"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Baixar CSV
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2">Informações sobre a Exportação</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Os arquivos incluem os filtros aplicados (período: {filters.period_days} dias)</li>
          {filters.company_filter && <li>• Dados filtrados para empresa específica</li>}
          <li>• Formato CSV compatível com Excel e outras ferramentas</li>
          <li>• Codificação UTF-8 com suporte a acentos</li>
        </ul>
      </div>
    </div>
  );
};