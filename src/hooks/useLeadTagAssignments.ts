import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useLeadTagAssignments = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const assignTagsToLead = useCallback(async (leadId: string, tagIds: string[]) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      // Primeiro, remover todas as tags existentes do lead
      await supabase
        .from('lead_tag_assignments')
        .delete()
        .eq('lead_id', leadId);

      // Depois, inserir as novas tags
      if (tagIds.length > 0) {
        const assignments = tagIds.map(tagId => ({
          lead_id: leadId,
          tag_id: tagId
        }));

        const { error } = await supabase
          .from('lead_tag_assignments')
          .insert(assignments);

        if (error) {
          console.error('Error assigning tags:', error);
          throw error;
        }
      }

      toast({
        title: "Sucesso",
        description: "Tags atualizadas com sucesso"
      });
    } catch (error) {
      console.error('Erro ao atualizar tags:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as tags",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const getLeadTags = useCallback(async (leadId: string) => {
    try {
      const { data, error } = await supabase
        .from('lead_tag_assignments')
        .select(`
          lead_tags(id, name, color)
        `)
        .eq('lead_id', leadId);

      if (error) {
        console.error('Error fetching lead tags:', error);
        throw error;
      }

      return data?.map(assignment => (assignment as any).lead_tags).filter(Boolean) || [];
    } catch (error) {
      console.error('Erro ao buscar tags do lead:', error);
      return [];
    }
  }, []);

  return {
    loading,
    assignTagsToLead,
    getLeadTags
  };
};