import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAllCompanies } from '@/hooks/useAllCompanies';
import { useSaasProfiles } from '@/hooks/useSaasProfiles';
import { useToast } from '@/hooks/use-toast';

interface TransferUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  onSuccess: () => void;
}

export const TransferUserDialog = ({ open, onOpenChange, user, onSuccess }: TransferUserDialogProps) => {
  const [newCompanyId, setNewCompanyId] = useState('');
  const [loading, setLoading] = useState(false);

  const { companies } = useAllCompanies();
  const { updateProfile } = useSaasProfiles();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCompanyId || !user) {
      toast({
        title: "Erro",
        description: "Selecione uma empresa",
        variant: "destructive"
      });
      return;
    }

    if (newCompanyId === user.company_id) {
      toast({
        title: "Erro", 
        description: "O usuário já pertence a esta empresa",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await updateProfile(user.id, { company_id: newCompanyId });
      onSuccess();
      onOpenChange(false);
      setNewCompanyId('');
    } catch (error) {
      // Erro já tratado no hook
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transferir Usuário</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Usuário</Label>
            <div className="p-2 bg-muted rounded-md">
              <div className="font-medium">{user.full_name || 'Nome não informado'}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
              <div className="text-sm text-muted-foreground">
                Empresa atual: {user.companies?.name || 'Sem empresa'}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Nova Empresa *</Label>
            <Select 
              value={newCompanyId} 
              onValueChange={setNewCompanyId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a nova empresa" />
              </SelectTrigger>
              <SelectContent>
                {companies
                  .filter(company => company.id !== user.company_id)
                  .map(company => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Transferindo...' : 'Transferir Usuário'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};