
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Company {
  id: string;
  name: string;
  domain: string;
  logo_url: string;
  phone: string;
  address: string;
  website: string;
  location: string;
  industry: string;
  size: string;
  revenue: string;
  status: string;
  timezone: string;
  currency: string;
  date_format: string;
  notification_settings: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  billing_settings: {
    auto_billing: boolean;
    invoice_email: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CompanySetting {
  id: string;
  company_id: string;
  setting_key: string;
  setting_value: any;
  created_at: string;
  updated_at: string;
}

export const useCompanySettings = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: company, isLoading: isLoadingCompany } = useQuery({
    queryKey: ['company'],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user?.id)
        .single();

      if (!profile?.company_id) throw new Error('Empresa não encontrada');

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', profile.company_id)
        .single();

      if (error) throw error;
      return data as Company;
    },
    enabled: !!user,
  });

  const { data: settings = [], isLoading: isLoadingSettings } = useQuery({
    queryKey: ['company-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('company_id', company?.id);

      if (error) throw error;
      return data as CompanySetting[];
    },
    enabled: !!company?.id,
  });

  const updateCompany = useMutation({
    mutationFn: async (updates: Partial<Company>) => {
      if (!company?.id) throw new Error('Empresa não encontrada');

      const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', company.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] });
      toast.success('Configurações da empresa atualizadas!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar empresa:', error);
      toast.error('Erro ao atualizar configurações');
    },
  });

  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      if (!company?.id) throw new Error('Empresa não encontrada');

      const { data, error } = await supabase
        .from('company_settings')
        .upsert({
          company_id: company.id,
          setting_key: key,
          setting_value: value,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-settings'] });
      toast.success('Configuração atualizada!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar configuração:', error);
      toast.error('Erro ao atualizar configuração');
    },
  });

  const getSetting = (key: string) => {
    return settings.find(setting => setting.setting_key === key)?.setting_value;
  };

  return {
    company,
    settings,
    isLoading: isLoadingCompany || isLoadingSettings,
    updateCompany,
    updateSetting,
    getSetting,
  };
};
