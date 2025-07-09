import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { usePartners } from '@/hooks/usePartners';

interface EditPartnerDialogProps {
  partner: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditPartnerDialog = ({ partner, open, onOpenChange }: EditPartnerDialogProps) => {
  const { updatePartner } = usePartners();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    contact_person: '',
    description: '',
    status: 'ativo'
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (partner) {
      setFormData({
        name: partner.name || '',
        email: partner.email || '',
        phone: partner.phone || '',
        contact_person: partner.contact_person || '',
        description: partner.description || '',
        status: partner.status || 'ativo'
      });
    }
  }, [partner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !partner?.id) return;

    setUpdating(true);
    try {
      await updatePartner(partner.id, formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao atualizar parceiro:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Parceiro</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="name">Nome do Parceiro *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name')(e.target.value)}
                placeholder="Digite o nome do parceiro"
                required
              />
            </div>

            <div>
              <Label htmlFor="contact_person">Pessoa de Contato</Label>
              <Input
                id="contact_person"
                value={formData.contact_person}
                onChange={(e) => handleChange('contact_person')(e.target.value)}
                placeholder="Nome da pessoa responsável"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email')(e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone')(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={handleChange('status')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description')(e.target.value)}
                placeholder="Descrição do parceiro (opcional)"
                rows={3}
              />
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={updating || !formData.name.trim()}>
            {updating ? 'Atualizando...' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};