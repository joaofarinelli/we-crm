import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, Trophy, AlertCircle } from 'lucide-react';
import { useUserGoals } from '@/hooks/useUserGoals';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const GoalsWidget = () => {
  const { getMyGoals, getGoalProgress, loading } = useUserGoals();
  const myGoals = getMyGoals();
  const activeGoals = myGoals.filter(goal => goal.status === 'ativa');

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Minhas Metas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeGoals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Minhas Metas
          </CardTitle>
          <CardDescription>
            Nenhuma meta ativa no momento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Trophy className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Suas metas aparecerão aqui quando criadas pelo administrador
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getGoalTypeLabel = (type: string) => {
    const types = {
      vendas: 'Vendas',
      agendamentos: 'Agendamentos',
      conversoes: 'Conversões',
      receita: 'Receita'
    };
    return types[type] || type;
  };

  const getPeriodLabel = (period: string) => {
    const periods = {
      mensal: 'Mensal',
      trimestral: 'Trimestral',
      anual: 'Anual'
    };
    return periods[period] || period;
  };

  const formatValue = (value: number, type: string) => {
    if (type === 'receita') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 0
      }).format(value);
    }
    return value.toString();
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'text-green-600';
    if (progress >= 75) return 'text-blue-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressIcon = (progress: number) => {
    if (progress >= 100) return Trophy;
    if (progress >= 75) return TrendingUp;
    return AlertCircle;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Minhas Metas
        </CardTitle>
        <CardDescription>
          Acompanhe seu progresso nas metas definidas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeGoals.map((goal) => {
          const progress = getGoalProgress(goal);
          const ProgressIcon = getProgressIcon(progress);
          
          return (
            <div key={goal.id} className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ProgressIcon className={`w-4 h-4 ${getProgressColor(progress)}`} />
                  <span className="font-medium">{getGoalTypeLabel(goal.goal_type)}</span>
                  <Badge variant="outline" className="text-xs">
                    {goal.period}
                  </Badge>
                </div>
                <span className={`text-sm font-medium ${getProgressColor(progress)}`}>
                  {progress.toFixed(1)}%
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progresso</span>
                  <span>
                    {formatValue(goal.current_value, goal.goal_type)} / {formatValue(goal.target_value, goal.goal_type)}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              
              <div className="text-xs text-muted-foreground">
                {getPeriodLabel(goal.period)}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};