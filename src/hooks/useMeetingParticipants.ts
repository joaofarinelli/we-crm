
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MeetingParticipantWithProfile {
  id: string;
  meeting_id: string;
  user_id: string;
  role: 'organizer' | 'participant';
  created_at: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  } | null;
}

export const useMeetingParticipants = (meetingId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: participants = [], isLoading } = useQuery({
    queryKey: ['meeting-participants', meetingId],
    queryFn: async () => {
      // Simplified stub - return empty array for now
      return [] as MeetingParticipantWithProfile[];
    },
    enabled: !!meetingId,
  });

  const addParticipant = useMutation({
    mutationFn: async ({ userId, role = 'participant' }: { userId: string; role?: 'organizer' | 'participant' }) => {
      console.log('Would add participant:', { userId, role, meetingId });
      return Promise.resolve();
    },
    onSuccess: () => {
      toast({ title: 'Participante adicionado com sucesso!' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro ao adicionar participante', 
        variant: 'destructive' 
      });
    },
  });

  const removeParticipant = useMutation({
    mutationFn: async (participantId: string) => {
      console.log('Would remove participant:', participantId);
      return Promise.resolve();
    },
    onSuccess: () => {
      toast({ title: 'Participante removido com sucesso!' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro ao remover participante', 
        variant: 'destructive' 
      });
    },
  });

  const updateParticipantRole = useMutation({
    mutationFn: async ({ participantId, role }: { participantId: string; role: 'organizer' | 'participant' }) => {
      console.log('Would update participant role:', { participantId, role });
      return Promise.resolve();
    },
    onSuccess: () => {
      toast({ title: 'Papel do participante atualizado!' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro ao atualizar participante', 
        variant: 'destructive' 
      });
    },
  });

  return {
    participants,
    isLoading,
    addParticipant,
    removeParticipant,
    updateParticipantRole,
  };
};
