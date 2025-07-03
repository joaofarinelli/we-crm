import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface InvitationSettings {
  useNativeInvites: boolean;
  redirectUrl: string | null;
  defaultSendEmail: boolean;
}

export const useInvitationSettings = () => {
  const [settings, setSettings] = useState<InvitationSettings>({
    useNativeInvites: true,
    redirectUrl: null,
    defaultSendEmail: true
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSettings = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Obter company_id do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profileData?.company_id) {
        console.error('Erro ao buscar company_id:', profileError);
        return;
      }

      // Buscar configurações de convite
      const { data, error } = await supabase
        .from('company_settings')
        .select('setting_value')
        .eq('company_id', profileData.company_id)
        .eq('setting_key', 'invitation_settings')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data?.setting_value) {
        const parsedSettings = data.setting_value as unknown as InvitationSettings;
        setSettings(parsedSettings);
      }
    } catch (error) {
      console.error('Erro ao buscar configurações de convite:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações de convite",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<InvitationSettings>) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      // Obter company_id do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profileData?.company_id) {
        throw new Error('Company ID não encontrado');
      }

      const updatedSettings = { ...settings, ...newSettings };

      const { error } = await supabase
        .from('company_settings')
        .upsert({
          company_id: profileData.company_id,
          setting_key: 'invitation_settings',
          setting_value: updatedSettings
        });

      if (error) throw error;

      setSettings(updatedSettings);
      toast({
        title: "Sucesso",
        description: "Configurações de convite atualizadas"
      });
    } catch (error: any) {
      console.error('Erro ao atualizar configurações:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar as configurações",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  return {
    settings,
    loading,
    updateSettings,
    refetch: fetchSettings
  };
};