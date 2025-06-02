
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Download, Calendar } from 'lucide-react';

export const Reports = () => {
  const reports = [
    {
      title: 'Vendas por Período',
      description: 'Análise de vendas mensais e trimestrais',
      icon: BarChart3,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Performance de Leads',
      description: 'Taxa de conversão e origem dos leads',
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Relatório de Atividades',
      description: 'Tarefas e atividades realizadas',
      icon: Calendar,
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  const kpis = [
    { label: 'Taxa de Conversão', value: '24.5%', trend: '+3.2%' },
    { label: 'Ticket Médio', value: 'R$ 18.750', trend: '+8.1%' },
    { label: 'Leads Qualificados', value: '156', trend: '+12.4%' },
    { label: 'Ciclo de Vendas', value: '18 dias', trend: '-2.3%' }
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-1">Análises e métricas do seu negócio</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" />
          Exportar Dados
        </Button>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <Card key={index} className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">{kpi.label}</p>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              <p className={`text-sm mt-1 ${
                kpi.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {kpi.trend} vs mês anterior
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Relatórios Disponíveis */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Relatórios Disponíveis</h2>
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
                <Button variant="outline" size="sm">
                  Gerar Relatório
                </Button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Placeholder para Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendas por Mês</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Gráfico de vendas será exibido aqui</p>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline de Vendas</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Gráfico do pipeline será exibido aqui</p>
          </div>
        </Card>
      </div>
    </div>
  );
};
