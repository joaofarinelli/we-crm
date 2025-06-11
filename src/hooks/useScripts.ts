
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Script {
  id: string;
  title: string;
  content: string;
  category: string;
  description?: string;
  created_by: string;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateScriptData {
  title: string;
  content: string;
  category: string;
  description?: string;
}

export const useScripts = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: scripts = [], isLoading, error } = useQuery({
    queryKey: ['scripts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scripts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Script[];
    },
    enabled: !!user,
  });

  const createScript = useMutation({
    mutationFn: async (scriptData: CreateScriptData) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      // Buscar company_id do usuário atual
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      
      const { data, error } = await supabase
        .from('scripts')
        .insert({
          ...scriptData,
          created_by: user.id,
          company_id: profileData.company_id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scripts'] });
      toast.success('Material criado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar material:', error);
      toast.error('Erro ao criar material');
    },
  });

  const updateScript = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Script> & { id: string }) => {
      const { data, error } = await supabase
        .from('scripts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scripts'] });
      toast.success('Material atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar material:', error);
      toast.error('Erro ao atualizar material');
    },
  });

  const deleteScript = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('scripts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scripts'] });
      toast.success('Material excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir material:', error);
      toast.error('Erro ao excluir material');
    },
  });

  return {
    scripts,
    isLoading,
    error,
    createScript,
    updateScript,
    deleteScript,
  };
};
