
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSaasMetrics } from '@/hooks/useSaasMetrics';
import { Building2, Users, TrendingUp, UserPlus } from 'lucide-react';

export const AdminDashboard = () => {
  const { metrics, loading } = useSaasMetrics();

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-lg">Carregando métricas...</div>
      </div>
    );
  }

  const planColors: Record<string, string> = {
    basic: 'bg-gray-100 text-gray-800',
    premium: 'bg-blue-100 text-blue-800',
    enterprise: 'bg-purple-100 text-purple-800'
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard SaaS</h1>
        <p className="text-sm sm:text-base text-gray-600">Visão geral do sistema e métricas globais</p>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="min-h-[120px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total de Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{metrics?.overview?.total_companies || 0}</div>
            <p className="text-xs text-muted-foreground">
              Empresas cadastradas
            </p>
          </CardContent>
        </Card>

        <Card className="min-h-[120px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{metrics?.overview?.total_users || 0}</div>
            <p className="text-xs text-muted-foreground">
              Usuários ativos
            </p>
          </CardContent>
        </Card>

        <Card className="min-h-[120px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Empresas Ativas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{metrics?.overview?.active_companies || 0}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card className="min-h-[120px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Novos Usuários</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{metrics?.overview?.new_users_this_period || 0}</div>
            <p className="text-xs text-muted-foreground">
              Este mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Empresas por Plano */}
      <Card>
        <CardHeader>
          <CardTitle>Empresas por Plano</CardTitle>
          <CardDescription>
            Distribuição das empresas pelos diferentes planos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {metrics?.companies?.by_plan && Object.entries(metrics.companies.by_plan).map(([plan, count]) => (
              <div key={plan} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${planColors[plan] || 'bg-gray-100 text-gray-800'}`}>
                    {plan.charAt(0).toUpperCase() + plan.slice(1)}
                  </span>
                </div>
                <div className="text-2xl font-bold">{count as number}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Crescimento</CardTitle>
            <CardDescription>Métricas de crescimento dos últimos 30 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Novas empresas (30 dias)</span>
                <span className="font-semibold">{(metrics?.companies?.growth?.length || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Novos usuários (30 dias)</span>
                <span className="font-semibold">{metrics?.overview?.new_users_this_period || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total de leads</span>
                <span className="font-semibold">{metrics?.activities?.leads?.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total de reuniões</span>
                <span className="font-semibold">{metrics?.activities?.meetings?.total || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
            <CardDescription>Informações gerais do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Sistema</span>
                <span className="text-green-600 font-semibold">Online</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Última atualização</span>
                <span className="font-semibold">Hoje</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Empresas */}
      {metrics?.top_companies && metrics.top_companies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Empresas</CardTitle>
            <CardDescription>
              Empresas com melhor performance nos últimos 30 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.top_companies.slice(0, 5).map((company, index) => (
                <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{company.name}</p>
                      <p className="text-sm text-gray-500">
                        {company.users_count} usuários • {company.leads_count} leads • {company.appointments_count} agendamentos
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{company.activity_score}</p>
                    <p className="text-xs text-gray-500">Score</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
