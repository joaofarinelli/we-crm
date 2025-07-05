import { useState } from 'react';

export interface CompanySettings {
  id?: string;
  company_id?: string;
  name?: string;
  industry?: string;
  size?: string;
  location?: string;
  phone?: string;
  website?: string;
  logo_url?: string;
  whatsapp_support?: {
    enabled: boolean;
    phone_number: string;
    phone?: string;
    message: string;
  };
  notification_settings?: {
    email_notifications: boolean;
    whatsapp_notifications: boolean;
  };
  timezone?: string;
  currency?: string;
  date_format?: string;
  created_at?: string;
  updated_at?: string;
}

export const useCompanySettings = () => {
  const [settings, setSettings] = useState<CompanySettings>({
    name: 'Minha Empresa',
    industry: 'Tecnologia',
    size: '1-10',
    location: 'São Paulo, SP',
    phone: '(11) 99999-9999',
    website: 'https://minhaempresa.com',
    logo_url: '',
    whatsapp_support: {
      enabled: false,
      phone_number: '(11) 99999-9999',
      phone: '(11) 99999-9999',
      message: 'Olá! Como podemos ajudar você?'
    },
    notification_settings: {
      email_notifications: true,
      whatsapp_notifications: false
    },
    timezone: 'America/Sao_Paulo',
    currency: 'BRL',
    date_format: 'DD/MM/YYYY'
  });

  const updateCompanySettings = async (updates: Partial<CompanySettings>) => {
    console.log('Would update company settings:', updates);
    setSettings(prev => ({ ...prev, ...updates }));
    return Promise.resolve();
  };

  const uploadLogo = async (file: File) => {
    console.log('Would upload logo:', file.name);
    return 'https://example.com/logo.png';
  };

  return {
    settings,
    loading: false,
    updateCompanySettings,
    uploadLogo,
    // Legacy API compatibility
    company: settings,
    isLoading: false,
    updateCompany: {
      mutate: updateCompanySettings,
      isPending: false
    },
    isUploadingLogo: false
  };
};