
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfiles } from '@/hooks/useProfiles';
import { Meeting } from '@/types/meeting';

export const useMeetingsForCalendar = () => {
  const { user } = useAuth();
  const { profiles } = useProfiles();

  const currentUserProfile = profiles.find(p => p.id === user?.id);
  
  // Verificar se é admin através das permissões do cargo
  const userRole = currentUserProfile?.roles;
  const isAdmin = userRole?.permissions && 
    typeof userRole.permissions === 'object' && 
    (userRole.permissions as any).admin === true;

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ['meetings-for-calendar', user?.id, isAdmin],
    queryFn: async () => {
      if (!user?.id || !currentUserProfile?.company_id) return [];

      if (isAdmin) {
        // Admin vê todas as reuniões da empresa
        const { data, error } = await supabase
          .from('meetings')
          .select('*')
          .eq('company_id', currentUserProfile.company_id)
          .order('date', { ascending: false });
        
        if (error) throw error;
        return data as Meeting[];
      } else {
        // Primeiro buscar os IDs das reuniões onde o usuário é participante
        const { data: participantData, error: participantError } = await supabase
          .from('meeting_participants')
          .select('meeting_id')
          .eq('user_id', user.id);
        
        if (participantError) throw participantError;
        
        const meetingIds = participantData.map(p => p.meeting_id);
        
        if (meetingIds.length === 0) return [];
        
        // Buscar as reuniões usando os IDs encontrados
        const { data, error } = await supabase
          .from('meetings')
          .select('*')
          .eq('company_id', currentUserProfile.company_id)
          .in('id', meetingIds)
          .order('date', { ascending: false });
        
        if (error) throw error;
        return data as Meeting[];
      }
    },
    enabled: !!user?.id && !!currentUserProfile?.company_id,
  });

  return {
    meetings,
    isLoading,
    isAdmin,
  };
};
