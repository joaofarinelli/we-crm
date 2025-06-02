
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const metrics = [
  {
    title: 'Receita Total',
    value: 'R$ 124.850',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-green-600'
  },
  {
    title: 'Novos Leads',
    value: '156',
    change: '+8.2%',
    trend: 'up',
    icon: TrendingUp,
    color: 'text-blue-600'
  },
  {
    title: 'Vendas Fechadas',
    value: '23',
    change: '-2.1%',
    trend: 'down',
    icon: Target,
    color: 'text-purple-600'
  },
  {
    title: 'Total de Contatos',
    value: '1.284',
    change: '+15.3%',
    trend: 'up',
    icon: Users,
    color: 'text-orange-600'
  }
];

const recentLeads = [
  { name: 'João Silva', company: 'Tech Corp', value: 'R$ 25.000', status: 'Quente' },
  { name: 'Maria Santos', company: 'Inovação Ltda', value: 'R$ 18.500', status: 'Morno' },
  { name: 'Carlos Oliveira', company: 'StartUp XYZ', value: 'R$ 32.000', status: 'Quente' },
  { name: 'Ana Costa', company: 'Digital Solutions', value: 'R$ 15.200', status: 'Frio' }
];

export const Dashboard = () => {
  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral do seu negócio</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Último update</p>
          <p className="text-lg font-semibold text-gray-900">Agora mesmo</p>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className="p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${metric.color} bg-opacity-10`}>
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {metric.change}
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-gray-900">{metric.value}</h3>
                <p className="text-gray-600 text-sm mt-1">{metric.title}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pipeline de Vendas */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Pipeline de Vendas</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Prospecção</span>
                <span className="text-sm text-gray-500">45 leads</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Qualificação</span>
                <span className="text-sm text-gray-500">28 leads</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Proposta</span>
                <span className="text-sm text-gray-500">12 leads</span>
              </div>
              <Progress value={40} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Fechamento</span>
                <span className="text-sm text-gray-500">8 leads</span>
              </div>
              <Progress value={25} className="h-2" />
            </div>
          </div>
        </Card>

        {/* Leads Recentes */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Leads Recentes</h3>
          <div className="space-y-4">
            {recentLeads.map((lead, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <p className="font-medium text-gray-900">{lead.name}</p>
                  <p className="text-sm text-gray-500">{lead.company}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{lead.value}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    lead.status === 'Quente' 
                      ? 'bg-red-100 text-red-700'
                      : lead.status === 'Morno'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {lead.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
