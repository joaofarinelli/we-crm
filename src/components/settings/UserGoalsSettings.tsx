import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Target, Trophy, Calendar, Edit, Trash2 } from 'lucide-react';
import { useUserGoals } from '@/hooks/useUserGoals';
import { useProfiles } from '@/hooks/useProfiles';
import { CreateGoalDialog } from './CreateGoalDialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const UserGoalsSettings = () => {
  const { goals, loading, deleteGoal, getGoalProgress, updateProgress } = useUserGoals();
  const { profiles } = useProfiles();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const handleDeleteGoal = async (goalId: string) => {
    if (confirm('Tem certeza que deseja remover esta meta?')) {
      await deleteGoal(goalId);
    }
  };

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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativa: { variant: 'default', label: 'Ativa' },
      pausada: { variant: 'secondary', label: 'Pausada' },
      concluida: { variant: 'success', label: 'Concluída' }
    };
    
    const config = statusConfig[status] || { variant: 'default', label: status };
    return (
      <Badge variant={config.variant as any}>
        {config.label}
      </Badge>
    );
  };

  const formatValue = (value: number, type: string) => {
    if (type === 'receita') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    }
    return value.toString();
  };

  const closers = profiles.filter(profile => 
    profile.roles?.name === 'Closer' || profile.roles?.name === 'closer'
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Metas da Equipe</h2>
          <p className="text-muted-foreground">
            Gerencie as metas dos closers da sua empresa
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={updateProgress}
            className="flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            Atualizar Progresso
          </Button>
          <Button 
            onClick={() => setCreateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Meta
          </Button>
        </div>
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma meta criada</h3>
            <p className="text-muted-foreground text-center mb-4">
              Crie metas para motivar e acompanhar o desempenho dos closers
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar primeira meta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {goals.map((goal) => {
            const progress = getGoalProgress(goal);
            const user = goal.user;
            
            return (
              <Card key={goal.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">
                        {user?.full_name || 'Usuário não encontrado'}
                      </CardTitle>
                      <CardDescription>
                        {getGoalTypeLabel(goal.goal_type)} • {getPeriodLabel(goal.period)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(goal.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingGoal(goal)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteGoal(goal.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span>Progresso</span>
                      <span className="font-medium">
                        {formatValue(goal.current_value, goal.goal_type)} / {formatValue(goal.target_value, goal.goal_type)}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="text-right text-sm text-muted-foreground">
                      {progress.toFixed(1)}% concluído
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {format(new Date(goal.start_date), 'dd/MM/yyyy', { locale: ptBR })} - {' '}
                        {format(new Date(goal.end_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CreateGoalDialog 
        open={createDialogOpen || !!editingGoal}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) setEditingGoal(null);
        }}
        editingGoal={editingGoal}
        closers={closers}
      />
    </div>
  );
};