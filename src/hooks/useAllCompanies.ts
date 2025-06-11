
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CompanyWithStats {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  size: string | null;
  plan: string | null;
  status: string | null;
  created_at: string;
  user_count: number;
  leads_count: number;
  appointments_count: number;
  phone: string | null;
  website: string | null;
  location: string | null;
}

export const useAllCompanies = () => {
  const [companies, setCompanies] = useState<CompanyWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCompanies = async () => {
    try {
      console.log('useAllCompanies: Fetching companies for SaaS admin...');
      
      const { data, error } = await supabase
        .from('admin_companies_view')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('useAllCompanies: Error fetching companies:', error);
        
        // Log security event for unauthorized access attempt
        if (error.code === 'PGRST116' || error.message?.includes('RLS')) {
          console.log('useAllCompanies: RLS policy blocked access - user may not be SaaS admin');
          await supabase.rpc('log_security_event', {
            event_type: 'unauthorized_company_access_attempt',
            details: { error: error.message, code: error.code }
          });
        }
        
        throw error;
      }
      
      console.log('useAllCompanies: Successfully fetched companies:', data?.length || 0);
      setCompanies(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar empresas:', error);
      
      if (error.code === 'PGRST116' || error.message?.includes('RLS')) {
        toast({
          title: "Acesso Negado",
          description: "Você não tem permissão para visualizar todas as empresas. Apenas administradores do sistema podem acessar essa funcionalidade.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível carregar as empresas",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateCompanyStatus = async (id: string, status: string) => {
    try {
      console.log('useAllCompanies: Updating company status:', { id, status });
      
      const { error } = await supabase
        .from('companies')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('useAllCompanies: Error updating company status:', error);
        
        // Log security event for unauthorized update attempt
        if (error.code === 'PGRST116' || error.message?.includes('RLS')) {
          await supabase.rpc('log_security_event', {
            event_type: 'unauthorized_company_update_attempt',
            details: { company_id: id, attempted_status: status, error: error.message }
          });
        }
        
        throw error;
      }
      
      setCompanies(prev => 
        prev.map(company => 
          company.id === id ? { ...company, status } : company
        )
      );

      toast({
        title: "Sucesso",
        description: "Status da empresa atualizado com sucesso"
      });

      // Log successful status update
      await supabase.rpc('log_security_event', {
        event_type: 'company_status_updated',
        details: { company_id: id, new_status: status }
      });
      
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      
      if (error.code === 'PGRST116' || error.message?.includes('RLS')) {
        toast({
          title: "Acesso Negado",
          description: "Você não tem permissão para atualizar empresas",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o status da empresa",
          variant: "destructive"
        });
      }
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return { companies, loading, refetch: fetchCompanies, updateCompanyStatus };
};
