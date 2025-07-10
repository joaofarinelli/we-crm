import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserGoals, UserGoal } from '@/hooks/useUserGoals';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface CreateGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingGoal?: UserGoal | null;
  closers: any[];
}

export const CreateGoalDialog = ({ open, onOpenChange, editingGoal, closers }: CreateGoalDialogProps) => {
  const { createGoal, updateGoal } = useUserGoals();
  const { user } = useAuth();
  const { userInfo } = useCurrentUser();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    user_id: '',
    goal_type: 'vendas' as 'vendas' | 'agendamentos' | 'conversoes' | 'receita',
    target_value: '',
    period: 'mensal' as 'mensal' | 'trimestral' | 'anual',
    start_date: '',
    end_date: '',
    status: 'ativa' as 'ativa' | 'pausada' | 'concluida'
  });

  useEffect(() => {
    if (editingGoal) {
      setFormData({
        user_id: editingGoal.user_id,
        goal_type: editingGoal.goal_type,
        target_value: editingGoal.target_value.toString(),
        period: editingGoal.period,
        start_date: editingGoal.start_date,
        end_date: editingGoal.end_date,
        status: editingGoal.status
      });
    } else {
      // Calcular datas padrão baseado no período
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      setFormData({
        user_id: '',
        goal_type: 'vendas',
        target_value: '',
        period: 'mensal',
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        status: 'ativa'
      });
    }
  }, [editingGoal, open]);

  const handlePeriodChange = (period: string) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case 'mensal':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'trimestral':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
        break;
      case 'anual':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        return;
    }

    setFormData(prev => ({
      ...prev,
      period: period as any,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !userInfo?.company_id) return;
    
    setLoading(true);
    
    try {
      const goalData = {
        user_id: formData.user_id,
        company_id: userInfo.company_id,
        goal_type: formData.goal_type,
        target_value: parseFloat(formData.target_value),
        period: formData.period,
        start_date: formData.start_date,
        end_date: formData.end_date,
        created_by: user.id,
        status: formData.status
      };

      if (editingGoal) {
        await updateGoal(editingGoal.id, goalData);
      } else {
        await createGoal(goalData);
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar meta:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle>
            {editingGoal ? 'Editar Meta' : 'Nova Meta'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user_id">Closer</Label>
            <Select
              value={formData.user_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, user_id: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um closer" />
              </SelectTrigger>
              <SelectContent>
                {closers.map((closer) => (
                  <SelectItem key={closer.id} value={closer.id}>
                    {closer.full_name || closer.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal_type">Tipo de Meta</Label>
            <Select
              value={formData.goal_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, goal_type: value as any }))}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vendas">Vendas (Quantidade)</SelectItem>
                <SelectItem value="receita">Receita (Valor em R$)</SelectItem>
                <SelectItem value="agendamentos">Agendamentos</SelectItem>
                <SelectItem value="conversoes">Conversões</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_value">
              Meta {formData.goal_type === 'receita' ? '(R$)' : '(Quantidade)'}
            </Label>
            <Input
              id="target_value"
              type="number"
              step={formData.goal_type === 'receita' ? '0.01' : '1'}
              min="0"
              value={formData.target_value}
              onChange={(e) => setFormData(prev => ({ ...prev, target_value: e.target.value }))}
              placeholder={formData.goal_type === 'receita' ? '10000.00' : '50'}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="period">Período</Label>
            <Select
              value={formData.period}
              onValueChange={handlePeriodChange}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="trimestral">Trimestral</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Data Início</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Data Fim</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                required
              />
            </div>
          </div>

          {editingGoal && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="pausada">Pausada</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : editingGoal ? 'Atualizar' : 'Criar Meta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};