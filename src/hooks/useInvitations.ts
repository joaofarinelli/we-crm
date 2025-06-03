
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useProfiles } from '@/hooks/useProfiles';

interface Invitation {
  id: string;
  email: string;
  company_id: string;
  role_id: string;
  invited_by: string;
  token: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
  roles?: {
    name: string;
    description: string | null;
  };
}

export const useInvitations = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { profiles } = useProfiles();
  const { toast } = useToast();

  // Obter o company_id do usuário atual
  const currentUserProfile = profiles.find(p => p.id === user?.id);
  const userCompanyId = currentUserProfile?.company_id;

  const fetchInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('user_invitations')
        .select(`
          *,
          roles (
            name,
            description
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error('Erro ao buscar convites:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os convites",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createInvitation = async (email: string, roleId: string) => {
    if (!userCompanyId) {
      toast({
        title: "Erro",
        description: "Não foi possível identificar sua empresa",
        variant: "destructive"
      });
      throw new Error('Company ID not found');
    }

    try {
      const { data, error } = await supabase
        .from('user_invitations')
        .insert({
          email,
          role_id: roleId,
          invited_by: user?.id,
          company_id: userCompanyId
        })
        .select(`
          *,
          roles (
            name,
            description
          )
        `)
        .single();

      if (error) throw error;
      
      setInvitations(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Convite enviado com sucesso"
      });
      
      return data;
    } catch (error: any) {
      console.error('Erro ao criar convite:', error);
      toast({
        title: "Erro",
        description: error.message.includes('duplicate key') 
          ? "Este email já foi convidado para esta empresa" 
          : "Não foi possível enviar o convite",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteInvitation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_invitations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setInvitations(prev => prev.filter(inv => inv.id !== id));
      toast({
        title: "Sucesso",
        description: "Convite removido com sucesso"
      });
    } catch (error) {
      console.error('Erro ao remover convite:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o convite",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user && userCompanyId) {
      fetchInvitations();
    }
  }, [user, userCompanyId]);

  return {
    invitations,
    loading,
    createInvitation,
    deleteInvitation,
    refetch: fetchInvitations
  };
};
