
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  value: number | null;
  status: string | null;
  source: string | null;
  company_id: string;
  created_at: string;
}

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchLeads = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching leads for user:', user.id);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching leads:', error);
        throw error;
      }
      
      console.log('Fetched leads:', data);
      setLeads(data || []);
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os leads",
        variant: "destructive"
      });
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const createLead = async (leadData: Omit<Lead, 'id' | 'created_at' | 'company_id'>) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Creating lead:', leadData);
      
      // Buscar company_id do usuário atual
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      if (!profileData?.company_id) {
        throw new Error('Company ID not found for user');
      }

      const { data, error } = await supabase
        .from('leads')
        .insert([{ 
          ...leadData, 
          created_by: user.id,
          company_id: profileData.company_id 
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating lead:', error);
        throw error;
      }
      
      console.log('Lead created successfully:', data);
      setLeads(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Lead criado com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Erro ao criar lead:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o lead",
        variant: "destructive"
      });
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Updating lead:', id, updates);
      
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating lead:', error);
        throw error;
      }
      
      console.log('Lead updated successfully:', data);
      setLeads(prev => prev.map(lead => lead.id === id ? data : lead));
      toast({
        title: "Sucesso",
        description: "Lead atualizado com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o lead",
        variant: "destructive"
      });
    }
  };

  const deleteLead = async (id: string) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Attempting to delete lead:', id);
      
      // Usar a função personalizada para deletar com validação robusta
      const { data: result, error } = await supabase
        .rpc('delete_lead_safely', { lead_id: id });

      if (error) {
        console.error('Error calling delete function:', error);
        throw error;
      }

      console.log('Delete function result:', result);

      // Verificar se a função retornou sucesso
      if (!result.success) {
        console.error('Delete failed:', result.error);
        
        let errorMessage = "Não foi possível remover o lead";
        if (result.error === 'Permission denied: different company') {
          errorMessage = "Você não tem permissão para deletar este lead";
        } else if (result.error === 'Lead not found') {
          errorMessage = "Lead não encontrado";
        } else if (result.error === 'User company not found') {
          errorMessage = "Erro de configuração da empresa";
        }
        
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }

      // Se chegou aqui, o delete foi bem-sucedido
      console.log('Lead deleted successfully. Rows affected:', result.deleted_count);
      
      // Remover do estado local apenas se o delete foi bem-sucedido
      setLeads(prev => prev.filter(lead => lead.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Lead removido com sucesso"
      });
      
    } catch (error) {
      console.error('Erro ao deletar lead:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o lead",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchLeads();
    }
  }, [user]);

  return {
    leads,
    loading,
    createLead,
    updateLead,
    deleteLead,
    refetch: fetchLeads
  };
};
