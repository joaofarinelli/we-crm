import { useState } from 'react';

interface InvitationSettings {
  useNativeInvites: boolean;
  redirectUrl: string | null;
  defaultSendEmail: boolean;
}

// Simplified hook - using basic settings without database dependency
export const useInvitationSettings = () => {
  const [settings, setSettings] = useState<InvitationSettings>({
    useNativeInvites: true,
    redirectUrl: null,
    defaultSendEmail: true
  });

  const updateSettings = async (updates: Partial<InvitationSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    return Promise.resolve();
  };

  return {
    settings,
    updateSettings,
    loading: false
  };
};