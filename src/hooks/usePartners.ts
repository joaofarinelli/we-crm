import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Partner {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  contact_person: string | null;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export const usePartners = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPartners = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching partners:', error);
        throw error;
      }
      
      setPartners(data || []);
    } catch (error) {
      console.error('Erro ao buscar parceiros:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os parceiros",
        variant: "destructive"
      });
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [user?.id]);

  const createPartner = async (partnerData: Omit<Partner, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('partners')
        .insert([partnerData])
        .select()
        .single();

      if (error) {
        console.error('Error creating partner:', error);
        throw error;
      }
      
      setPartners(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Parceiro criado com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Erro ao criar parceiro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o parceiro",
        variant: "destructive"
      });
    }
  };

  const updatePartner = async (id: string, updates: Partial<Partner>) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('partners')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating partner:', error);
        throw error;
      }
      
      setPartners(prev => prev.map(partner => partner.id === id ? data : partner));
      toast({
        title: "Sucesso",
        description: "Parceiro atualizado com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Erro ao atualizar parceiro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o parceiro",
        variant: "destructive"
      });
    }
  };

  const deletePartner = async (id: string) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting partner:', error);
        throw error;
      }
      
      setPartners(prev => prev.filter(partner => partner.id !== id));
      toast({
        title: "Sucesso",
        description: "Parceiro removido com sucesso"
      });
    } catch (error) {
      console.error('Erro ao deletar parceiro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o parceiro",
        variant: "destructive"
      });
    }
  };

  return {
    partners,
    loading,
    createPartner,
    updatePartner,
    deletePartner,
    refetch: fetchPartners
  };
};