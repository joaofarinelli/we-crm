
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Meeting, MeetingAgenda, MeetingMinutes, MeetingAttachment } from '@/types/meeting';
import { useToast } from '@/hooks/use-toast';

export const useMeetingDetails = (meetingId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: meeting } = useQuery({
    queryKey: ['meeting', meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', meetingId)
        .single();
      
      if (error) throw error;
      return data as Meeting;
    },
    enabled: !!meetingId,
  });

  const { data: agendas = [] } = useQuery({
    queryKey: ['meeting-agendas', meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_agendas')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('order_index');
      
      if (error) throw error;
      return data as MeetingAgenda[];
    },
    enabled: !!meetingId,
  });

  const { data: minutes } = useQuery({
    queryKey: ['meeting-minutes', meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_minutes')
        .select('*')
        .eq('meeting_id', meetingId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as MeetingMinutes | null;
    },
    enabled: !!meetingId,
  });

  const { data: attachments = [] } = useQuery({
    queryKey: ['meeting-attachments', meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_attachments')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as MeetingAttachment[];
    },
    enabled: !!meetingId,
  });

  const updateMeeting = useMutation({
    mutationFn: async (updates: Partial<Meeting>) => {
      const { data, error } = await supabase
        .from('meetings')
        .update(updates)
        .eq('id', meetingId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting', meetingId] });
      toast({ title: 'Reunião atualizada com sucesso!' });
    },
    onError: (error) => {
      toast({ 
        title: 'Erro ao atualizar reunião', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const saveMinutes = useMutation({
    mutationFn: async (content: string) => {
      if (minutes) {
        const { data, error } = await supabase
          .from('meeting_minutes')
          .update({ content, updated_at: new Date().toISOString() })
          .eq('id', minutes.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('meeting_minutes')
          .insert([{ meeting_id: meetingId, content }])
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-minutes', meetingId] });
      toast({ title: 'Ata salva com sucesso!' });
    },
    onError: (error) => {
      toast({ 
        title: 'Erro ao salvar ata', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const addAgendaItem = useMutation({
    mutationFn: async (item: Omit<MeetingAgenda, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('meeting_agendas')
        .insert([item])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-agendas', meetingId] });
      toast({ title: 'Item da pauta adicionado!' });
    },
    onError: (error) => {
      toast({ 
        title: 'Erro ao adicionar item', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const updateAgendaItem = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MeetingAgenda> & { id: string }) => {
      const { data, error } = await supabase
        .from('meeting_agendas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-agendas', meetingId] });
      toast({ title: 'Item da pauta atualizado!' });
    },
    onError: (error) => {
      toast({ 
        title: 'Erro ao atualizar item', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const deleteAgendaItem = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('meeting_agendas')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-agendas', meetingId] });
      toast({ title: 'Item da pauta removido!' });
    },
    onError: (error) => {
      toast({ 
        title: 'Erro ao remover item', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const reorderAgendaItems = useMutation({
    mutationFn: async (items: { id: string; order_index: number }[]) => {
      const promises = items.map(item =>
        supabase
          .from('meeting_agendas')
          .update({ order_index: item.order_index })
          .eq('id', item.id)
      );
      
      const results = await Promise.all(promises);
      const errors = results.filter(result => result.error);
      
      if (errors.length > 0) {
        throw new Error('Erro ao reordenar itens');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-agendas', meetingId] });
      toast({ title: 'Itens reordenados com sucesso!' });
    },
    onError: (error) => {
      toast({ 
        title: 'Erro ao reordenar itens', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const addAttachment = useMutation({
    mutationFn: async (attachment: Omit<MeetingAttachment, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('meeting_attachments')
        .insert([attachment])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-attachments', meetingId] });
      toast({ title: 'Anexo adicionado!' });
    },
    onError: (error) => {
      toast({ 
        title: 'Erro ao adicionar anexo', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  return {
    meeting,
    agendas,
    minutes,
    attachments,
    updateMeeting,
    saveMinutes,
    addAgendaItem,
    updateAgendaItem,
    deleteAgendaItem,
    reorderAgendaItems,
    addAttachment,
  };
};
