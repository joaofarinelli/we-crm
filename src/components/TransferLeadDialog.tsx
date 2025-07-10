import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useClosers } from '@/hooks/useClosers';
import { useLeads } from '@/hooks/useLeads';
import { useToast } from '@/hooks/use-toast';

interface TransferLeadDialogProps {
  leadId: string | null;
  leadName: string;
  currentAssignedTo: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TransferLeadDialog = ({ 
  leadId, 
  leadName, 
  currentAssignedTo,
  open, 
  onOpenChange 
}: TransferLeadDialogProps) => {
  const [selectedCloser, setSelectedCloser] = useState<string>('');
  const { closers, loading: closersLoading } = useClosers();
  const { updateLead } = useLeads();
  const { toast } = useToast();

  const handleTransfer = async () => {
    if (!leadId || !selectedCloser) return;

    try {
      await updateLead(leadId, { assigned_to: selectedCloser });
      
      const selectedCloserName = closers.find(c => c.id === selectedCloser)?.full_name || 'Closer';
      
      toast({
        title: "Lead transferido",
        description: `Lead "${leadName}" foi transferido para ${selectedCloserName}`,
      });
      
      onOpenChange(false);
      setSelectedCloser('');
    } catch (error) {
      console.error('Erro ao transferir lead:', error);
      toast({
        title: "Erro",
        description: "Não foi possível transferir o lead",
        variant: "destructive"
      });
    }
  };

  const handleRemoveAssignment = async () => {
    if (!leadId) return;

    try {
      await updateLead(leadId, { assigned_to: null });
      
      toast({
        title: "Atribuição removida",
        description: `Lead "${leadName}" não está mais atribuído a nenhum closer`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao remover atribuição:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a atribuição",
        variant: "destructive"
      });
    }
  };

  const availableClosers = closers.filter(closer => closer.id !== currentAssignedTo);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Transferir Lead</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="text-sm text-gray-600">
            Lead: <span className="font-medium">{leadName}</span>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="closer">Transferir para</Label>
            {closersLoading ? (
              <div className="text-sm text-muted-foreground">Carregando closers...</div>
            ) : (
              <Select
                value={selectedCloser}
                onValueChange={setSelectedCloser}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um closer" />
                </SelectTrigger>
                <SelectContent>
                  {availableClosers.map((closer) => (
                    <SelectItem key={closer.id} value={closer.id}>
                      {closer.full_name || closer.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {currentAssignedTo && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleRemoveAssignment}
              className="w-full sm:w-auto"
            >
              Remover Atribuição
            </Button>
          )}
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleTransfer}
            disabled={!selectedCloser}
            className="w-full sm:w-auto"
          >
            Transferir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};