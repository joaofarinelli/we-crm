
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
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os leads",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createLead = async (leadData: Omit<Lead, 'id' | 'created_at' | 'company_id'>) => {
    try {
      // Buscar company_id do usuário atual
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;

      const { data, error } = await supabase
        .from('leads')
        .insert([{ 
          ...leadData, 
          created_by: user?.id,
          company_id: profileData.company_id 
        }])
        .select()
        .single();

      if (error) throw error;
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
    try {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
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
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;
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
