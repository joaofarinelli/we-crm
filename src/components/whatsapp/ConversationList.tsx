import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WhatsAppConversation } from '@/types/whatsapp';
import { ConversationItem } from './ConversationItem';
import { ConversationFilters, ConversationFilterType } from './ConversationFilters';
import { TransferConversationDialog } from './TransferConversationDialog';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useState } from 'react';

interface ConversationListProps {
  conversations: WhatsAppConversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  companyId: string;
}

export const ConversationList = ({ conversations, selectedId, onSelect, companyId }: ConversationListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<ConversationFilterType>('all');
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [conversationToTransfer, setConversationToTransfer] = useState<WhatsAppConversation | null>(null);
  const { userInfo } = useCurrentUser();

  const handleTransfer = (conversation: WhatsAppConversation) => {
    setConversationToTransfer(conversation);
    setTransferDialogOpen(true);
  };

  const filteredConversations = conversations.filter(conv => {
    // Filtro de busca
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      conv.contact?.name?.toLowerCase().includes(searchLower) ||
      conv.contact?.phone?.includes(searchTerm) ||
      conv.last_message?.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    // Filtro de atribuição
    if (filter === 'mine') {
      return conv.assigned_to === userInfo?.user_id;
    } else if (filter === 'unassigned') {
      return !conv.assigned_to;
    }

    return true; // 'all'
  });

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <ConversationFilters
        currentFilter={filter}
        onFilterChange={setFilter}
        conversations={conversations}
        currentUserId={userInfo?.user_id}
      />
      
      <div className="flex-shrink-0 p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar conversas..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredConversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isSelected={conversation.id === selectedId}
                  onClick={() => onSelect(conversation.id)}
                  onTransfer={handleTransfer}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      <TransferConversationDialog
        conversationId={conversationToTransfer?.id || null}
        contactName={conversationToTransfer?.contact?.name || conversationToTransfer?.contact?.phone || 'Desconhecido'}
        currentAssignedTo={conversationToTransfer?.assigned_to || null}
        companyId={companyId}
        open={transferDialogOpen}
        onOpenChange={(open) => {
          setTransferDialogOpen(open);
          if (!open) {
            setConversationToTransfer(null);
          }
        }}
      />
    </div>
  );
};
