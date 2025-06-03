
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Closer {
  id: string;
  full_name: string | null;
  email: string | null;
}

export const useClosers = () => {
  const [closers, setClosers] = useState<Closer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchClosers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          roles (
            name
          )
        `)
        .eq('roles.name', 'Closer');

      if (error) throw error;
      
      setClosers(data || []);
    } catch (error) {
      console.error('Erro ao buscar closers:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de closers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClosers();
  }, []);

  return {
    closers,
    loading,
    refetch: fetchClosers
  };
};
