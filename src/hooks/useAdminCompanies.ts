
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateCompanyData {
  name?: string;
  domain?: string;
  industry?: string;
  size?: string;
  location?: string;
  website?: string;
  phone?: string;
  plan?: string;
  status?: string;
  logo_url?: string;
  timezone?: string;
  currency?: string;
  date_format?: string;
  whatsapp_phone?: string;
  whatsapp_message?: string;
  whatsapp_enabled?: boolean;
  email_notifications?: boolean;
  whatsapp_notifications?: boolean;
}

interface UpdateCompanyData extends CreateCompanyData {
  id: string;
}

export const useAdminCompanies = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createCompany = async (data: CreateCompanyData) => {
    if (!data.name) {
      toast({
        title: "Erro",
        description: "Nome da empresa é obrigatório",
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);
    try {
      console.log('useAdminCompanies: Creating company:', data);
      
      const { data: companyData, error } = await supabase
        .from('companies')
        .insert({
          name: data.name,
          domain: data.domain || null,
          industry: data.industry || null,
          size: data.size || null,
          location: data.location || null,
          website: data.website || null,
          phone: data.phone || null,
          plan: data.plan || 'basic',
          status: data.status || 'Prospect',
          logo_url: data.logo_url || null,
          timezone: data.timezone || 'America/Sao_Paulo',
          currency: data.currency || 'BRL',
          date_format: data.date_format || 'DD/MM/YYYY',
          whatsapp_phone: data.whatsapp_phone || null,
          whatsapp_message: data.whatsapp_message || 'Olá! Como podemos ajudar você?',
          whatsapp_enabled: data.whatsapp_enabled ?? false,
          email_notifications: data.email_notifications ?? true,
          whatsapp_notifications: data.whatsapp_notifications ?? false
        })
        .select()
        .single();

      if (error || !companyData) {
        console.error('useAdminCompanies: Error creating company:', error);
        throw error || new Error('Failed to create company');
      }

      toast({
        title: "Sucesso",
        description: "Empresa criada com sucesso"
      });

      return companyData.id;
    } catch (error: any) {
      console.error('Erro ao criar empresa:', error);
      
      if (error.code === 'PGRST116' || error.message?.includes('RLS')) {
        toast({
          title: "Acesso Negado",
          description: "Você não tem permissão para criar empresas",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível criar a empresa",
          variant: "destructive"
        });
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateCompany = async (data: UpdateCompanyData) => {
    if (!data.name) {
      toast({
        title: "Erro",
        description: "Nome da empresa é obrigatório",
        variant: "destructive"
      });
      return false;
    }

    setLoading(true);
    try {
      console.log('useAdminCompanies: Updating company:', data);
      
      const { error } = await supabase
        .from('companies')
        .update({
          name: data.name,
          domain: data.domain || null,
          industry: data.industry || null,
          size: data.size || null,
          location: data.location || null,
          website: data.website || null,
          phone: data.phone || null,
          plan: data.plan,
          status: data.status,
          logo_url: data.logo_url || null,
          timezone: data.timezone,
          currency: data.currency,
          date_format: data.date_format,
          whatsapp_phone: data.whatsapp_phone,
          whatsapp_message: data.whatsapp_message,
          whatsapp_enabled: data.whatsapp_enabled,
          email_notifications: data.email_notifications,
          whatsapp_notifications: data.whatsapp_notifications
        })
        .eq('id', data.id);

      if (error) {
        console.error('useAdminCompanies: Error updating company:', error);
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Empresa atualizada com sucesso"
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar empresa:', error);
      
      if (error.code === 'PGRST116' || error.message?.includes('RLS')) {
        toast({
          title: "Acesso Negado",
          description: "Você não tem permissão para atualizar empresas",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a empresa",
          variant: "destructive"
        });
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const uploadLogo = async (file: File): Promise<string | null> => {
    try {
      console.log('Uploading logo:', file.name);
      
      // Simulate upload - in production, you would use Supabase Storage
      const formData = new FormData();
      formData.append('file', file);
      
      // For now, return a placeholder URL
      // In production, implement actual file upload to Supabase Storage
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload delay
      
      const logoUrl = `https://example.com/logos/${Date.now()}-${file.name}`;
      
      toast({
        title: "Sucesso",
        description: "Logo enviado com sucesso"
      });
      
      return logoUrl;
    } catch (error) {
      console.error('Erro ao fazer upload do logo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer upload do logo",
        variant: "destructive"
      });
      return null;
    }
  };

  return { createCompany, updateCompany, uploadLogo, loading };
};
