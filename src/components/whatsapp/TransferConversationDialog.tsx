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
import { useProfiles } from '@/hooks/useProfiles';
import { useWhatsAppConversations } from '@/hooks/useWhatsAppConversations';
import { toast } from 'sonner';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface TransferConversationDialogProps {
  conversationId: string | null;
  contactName: string;
  currentAssignedTo: string | null;
  companyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TransferConversationDialog = ({ 
  conversationId, 
  contactName, 
  currentAssignedTo,
  companyId,
  open, 
  onOpenChange 
}: TransferConversationDialogProps) => {
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const { profiles, loading: profilesLoading } = useProfiles();
  const { updateConversation } = useWhatsAppConversations(companyId);
  const { userInfo } = useCurrentUser();

  const handleTransfer = async () => {
    if (!conversationId || !selectedAgent) return;

    try {
      await updateConversation.mutateAsync({
        conversationId,
        updates: { assigned_to: selectedAgent }
      });
      
      const selectedAgentName = profiles.find(p => p.id === selectedAgent)?.full_name || 'Atendente';
      
      toast.success(`Conversa de "${contactName}" transferida para ${selectedAgentName}`);
      
      onOpenChange(false);
      setSelectedAgent('');
    } catch (error) {
      console.error('Erro ao transferir conversa:', error);
      toast.error('Não foi possível transferir a conversa');
    }
  };

  const handleRemoveAssignment = async () => {
    if (!conversationId) return;

    try {
      await updateConversation.mutateAsync({
        conversationId,
        updates: { assigned_to: null }
      });
      
      toast.success(`Conversa de "${contactName}" não está mais atribuída`);
      
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao remover atribuição:', error);
      toast.error('Não foi possível remover a atribuição');
    }
  };

  const handleAssignToMe = async () => {
    if (!conversationId || !userInfo?.user_id) return;

    try {
      await updateConversation.mutateAsync({
        conversationId,
        updates: { assigned_to: userInfo.user_id }
      });
      
      toast.success(`Você assumiu o atendimento de "${contactName}"`);
      
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao assumir atendimento:', error);
      toast.error('Não foi possível assumir o atendimento');
    }
  };

  const availableAgents = profiles.filter(profile => profile.id !== currentAssignedTo);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Transferir Conversa</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="text-sm text-muted-foreground">
            Contato: <span className="font-medium text-foreground">{contactName}</span>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="agent">Transferir para</Label>
            {profilesLoading ? (
              <div className="text-sm text-muted-foreground">Carregando atendentes...</div>
            ) : (
              <Select
                value={selectedAgent}
                onValueChange={setSelectedAgent}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um atendente" />
                </SelectTrigger>
                <SelectContent>
                  {availableAgents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.full_name || agent.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {currentAssignedTo !== userInfo?.user_id && (
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleAssignToMe}
              className="w-full sm:w-auto"
            >
              Assumir para Mim
            </Button>
          )}
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
            disabled={!selectedAgent}
            className="w-full sm:w-auto"
          >
            Transferir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};