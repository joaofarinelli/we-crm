import { useState } from 'react';

interface Invitation {
  id: string;
  email: string;
  company_id: string;
  role_id: string;
  invited_by: string;
  token: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
  sent_via_email?: boolean;
  supabase_invite_id?: string | null;
  roles?: {
    name: string;
    description: string | null;
  };
}

// Simplified hook - using empty data without database dependency
export const useInvitations = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  const sendInvitation = async (email: string, roleId: string, sendEmail = true) => {
    console.log('Invitation would be sent to:', email, 'with role:', roleId, 'send email:', sendEmail);
    return Promise.resolve();
  };

  const cancelInvitation = async (id: string) => {
    console.log('Invitation would be cancelled:', id);
    return Promise.resolve();
  };

  const resendInvitation = async (id: string) => {
    console.log('Invitation would be resent:', id);
    return Promise.resolve();
  };

  const deleteInvitation = async (id: string) => {
    console.log('Invitation would be deleted:', id);
    return Promise.resolve();
  };

  const createN8nInvitation = async (email: string, roleId: string) => {
    console.log('N8n invitation would be created for:', email, 'with role:', roleId);
    return Promise.resolve();
  };

  return {
    invitations,
    loading: false,
    sendInvitation,
    cancelInvitation,
    resendInvitation,
    deleteInvitation,
    createN8nInvitation,
    refetch: () => Promise.resolve()
  };
};