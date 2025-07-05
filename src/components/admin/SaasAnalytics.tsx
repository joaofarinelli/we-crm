import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSaasAnalytics, type AnalyticsFilters } from '@/hooks/useSaasAnalytics';
import { AnalyticsFiltersComponent as FiltersComponent } from './AnalyticsFilters';
import { AnalyticsOverview } from './AnalyticsOverview';
import { CompaniesAnalytics } from './CompaniesAnalytics';
import { UsersAnalytics } from './UsersAnalytics';
import { ActivitiesAnalytics } from './ActivitiesAnalytics';
import { PerformanceAnalytics } from './PerformanceAnalytics';
import { ExportSaasDataSection } from './ExportSaasDataSection';

export const SaasAnalytics = () => {
  const [filters, setFilters] = useState<AnalyticsFilters>({ period_days: 30 });
  const { analytics, loading } = useSaasAnalytics(filters);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-lg">Carregando analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Dados não disponíveis</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics SaaS</h1>
        <p className="text-sm sm:text-base text-gray-600">Análise detalhada do desempenho do sistema</p>
      </div>

      <FiltersComponent filters={filters} onFiltersChange={setFilters} />

      <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-6 min-w-[600px]">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Visão Geral</TabsTrigger>
            <TabsTrigger value="companies" className="text-xs sm:text-sm">Empresas</TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm">Usuários</TabsTrigger>
            <TabsTrigger value="activities" className="text-xs sm:text-sm">Atividades</TabsTrigger>
            <TabsTrigger value="performance" className="text-xs sm:text-sm">Performance</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs sm:text-sm">Relatórios</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <AnalyticsOverview data={analytics} />
        </TabsContent>

        <TabsContent value="companies">
          <CompaniesAnalytics data={analytics.companies} />
        </TabsContent>

        <TabsContent value="users">
          <UsersAnalytics data={analytics.users} />
        </TabsContent>

        <TabsContent value="activities">
          <ActivitiesAnalytics data={analytics.activities} />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceAnalytics data={analytics.top_companies} />
        </TabsContent>

        <TabsContent value="reports">
          <ExportSaasDataSection analytics={analytics} filters={filters} />
        </TabsContent>
      </Tabs>
    </div>
  );
};