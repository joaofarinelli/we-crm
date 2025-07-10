import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: any;
  is_system_role: boolean;
  company_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useRealtimeRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  const fetchRoles = async () => {
    try {
      // O RLS já filtra automaticamente os cargos pela empresa do usuário
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (error) throw error;
      setRoles(data || []);
    } catch (error) {
      console.error('Erro ao buscar cargos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os cargos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createRole = async (roleData: { name: string; description: string }) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      // Obter o company_id do usuário atual
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profileData?.company_id) {
        toast({
          title: "Erro",
          description: "Não foi possível identificar sua empresa",
          variant: "destructive"
        });
        throw new Error('Company ID not found');
      }

      const { data, error } = await supabase
        .from('roles')
        .insert({
          name: roleData.name,
          description: roleData.description,
          permissions: {},
          is_system_role: false,
          company_id: profileData.company_id
        })
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Cargo criado com sucesso"
      });
      
      return data;
    } catch (error: any) {
      console.error('Erro ao criar cargo:', error);
      if (error.message.includes('duplicate key')) {
        toast({
          title: "Erro",
          description: "Já existe um cargo com este nome na sua empresa",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível criar o cargo",
          variant: "destructive"
        });
      }
      throw error;
    }
  };

  const updateRole = async (id: string, updates: { name?: string; description?: string; permissions?: any }) => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Cargo atualizado com sucesso"
      });
      
      return data;
    } catch (error: any) {
      console.error('Erro ao atualizar cargo:', error);
      if (error.message.includes('duplicate key')) {
        toast({
          title: "Erro",
          description: "Já existe um cargo com este nome na sua empresa",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o cargo",
          variant: "destructive"
        });
      }
      throw error;
    }
  };

  const deleteRole = async (id: string) => {
    try {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Cargo removido com sucesso"
      });
    } catch (error) {
      console.error('Erro ao remover cargo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o cargo",
        variant: "destructive"
      });
    }
  };

  const updateRolePermissions = async (id: string, permissions: any) => {
    await updateRole(id, { permissions });
  };

  useEffect(() => {
    if (!user) return;
    
    fetchRoles();

    // Cleanup function to remove channel
    const cleanup = () => {
      if (channelRef.current && isSubscribedRef.current) {
        console.log('Cleaning up realtime roles channel');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };

    // Clean up any existing channel first
    cleanup();

    // Create unique channel name using user ID and timestamp
    const channelName = `realtime-roles-${user.id}-${Date.now()}`;
    
    // Setup realtime subscription
    const channel = supabase.channel(channelName);
    
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'roles'
        },
        (payload) => {
          console.log('Realtime role change detected:', payload);
          setIsUpdating(true);
          
          fetchRoles().finally(() => {
            setIsUpdating(false);
          });
        }
      )
      .subscribe((status) => {
        console.log('Realtime roles subscription status:', status);
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
        }
      });

    channelRef.current = channel;

    return cleanup;
  }, [user]);

  return {
    roles,
    loading,
    isUpdating,
    createRole,
    updateRole,
    updateRolePermissions,
    deleteRole,
    refetch: fetchRoles
  };
};