
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role_id: string | null;
  company_id: string | null;
  created_at: string;
  updated_at: string;
  roles?: {
    name: string;
    description: string | null;
    is_system_role: boolean;
    permissions: any;
  };
  companies?: {
    name: string;
    domain: string | null;
    plan: string | null;
  };
}

export const useProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProfiles = async () => {
    try {
      // Primeiro obter o company_id do usuário atual
      const { data: currentUserProfile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user?.id)
        .single();

      if (profileError || !currentUserProfile?.company_id) {
        console.error('Erro ao buscar company_id do usuário:', profileError);
        setProfiles([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          roles (
            name,
            description,
            is_system_role,
            permissions
          ),
          companies (
            name,
            domain,
            plan
          )
        `)
        .eq('company_id', currentUserProfile.company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Erro ao buscar perfis:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os perfis",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (id: string, updates: Partial<Profile>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          roles (
            name,
            description,
            is_system_role,
            permissions
          ),
          companies (
            name,
            domain,
            plan
          )
        `)
        .single();

      if (error) throw error;
      setProfiles(prev => prev.map(profile => profile.id === id ? data : profile));
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil",
        variant: "destructive"
      });
    }
  };

  const deleteProfile = async (id: string) => {
    try {
      // Verificar se não está tentando deletar a si mesmo
      if (id === user?.id) {
        toast({
          title: "Erro",
          description: "Você não pode deletar seu próprio perfil",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Atualizar estado local removendo o perfil deletado
      setProfiles(prev => prev.filter(profile => profile.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Usuário removido com sucesso"
      });
    } catch (error) {
      console.error('Erro ao deletar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o usuário",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfiles();
    }
  }, [user]);

  return {
    profiles,
    loading,
    updateProfile,
    deleteProfile,
    refetch: fetchProfiles
  };
};
