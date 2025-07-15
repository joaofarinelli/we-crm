import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAllCompanies } from '@/hooks/useAllCompanies';
import { useRoles } from '@/hooks/useRoles';
import { useSaasProfiles } from '@/hooks/useSaasProfiles';
import { useToast } from '@/hooks/use-toast';

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  onSuccess: () => void;
}

export const EditUserDialog = ({ open, onOpenChange, user, onSuccess }: EditUserDialogProps) => {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    company_id: '',
    role_id: '',
    is_super_admin: false
  });
  const [loading, setLoading] = useState(false);

  const { companies } = useAllCompanies();
  const { roles } = useRoles();
  const { updateProfile } = useSaasProfiles();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        full_name: user.full_name || '',
        company_id: user.company_id || 'none',
        role_id: user.role_id || 'none',
        is_super_admin: user.is_super_admin || false
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    setLoading(true);
    try {
      // Converter "none" de volta para valores vazios antes de enviar
      const dataToSend = {
        ...formData,
        company_id: formData.is_super_admin || formData.company_id === 'none' ? null : formData.company_id,
        role_id: formData.is_super_admin || formData.role_id === 'none' ? null : formData.role_id
      };
      
      await updateProfile(user.id, dataToSend);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      // Erro já tratado no hook
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="usuario@exemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Nome Completo</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="Nome do usuário"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_super_admin"
                checked={formData.is_super_admin}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ 
                    ...prev, 
                    is_super_admin: checked === true,
                    company_id: checked === true ? 'none' : prev.company_id,
                    role_id: checked === true ? 'none' : prev.role_id
                  }))
                }
              />
              <Label htmlFor="is_super_admin" className="text-sm font-medium">
                Super Administrador (acesso total ao sistema)
              </Label>
            </div>
          </div>

          {!formData.is_super_admin && (
            <>
              <div className="space-y-2">
                <Label htmlFor="company">Empresa</Label>
                <Select 
                  value={formData.company_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, company_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem empresa</SelectItem>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Cargo</Label>
                <Select 
                  value={formData.role_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, role_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem cargo</SelectItem>
                    {roles.filter(role => role.name !== 'Administrador do Sistema').map(role => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};