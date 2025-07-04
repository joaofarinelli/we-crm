
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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

export const useInvitations = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchInvitations = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Primeiro, obter o company_id do usuário atual
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
        setInvitations([]);
        return;
      }

      if (!profileData?.company_id) {
        console.log('Usuário não possui company_id definido');
        setInvitations([]);
        return;
      }

      // Buscar convites da empresa do usuário
      const { data, error } = await supabase
        .from('user_invitations')
        .select(`
          *,
          roles (
            name,
            description
          )
        `)
        .eq('company_id', profileData.company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Convites carregados:', data);
      setInvitations(data || []);
    } catch (error) {
      console.error('Erro ao buscar convites:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os convites",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createInvitation = async (email: string, roleId: string) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      // Obter o company_id do usuário atual
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
        toast({
          title: "Erro",
          description: "Não foi possível identificar seu perfil. Verifique se você está logado corretamente.",
          variant: "destructive"
        });
        throw profileError;
      }

      if (!profileData?.company_id) {
        toast({
          title: "Configuração Necessária",
          description: "Seu perfil não está associado a uma empresa. Entre em contato com o administrador do sistema.",
          variant: "destructive"
        });
        throw new Error('Company ID not found - user profile not properly configured');
      }

      const { data, error } = await supabase
        .from('user_invitations')
        .insert({
          email,
          role_id: roleId,
          invited_by: user.id,
          company_id: profileData.company_id
        })
        .select(`
          *,
          roles (
            name,
            description
          )
        `)
        .single();

      if (error) throw error;
      
      setInvitations(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Convite enviado com sucesso"
      });
      
      return data;
    } catch (error: any) {
      console.error('Erro ao criar convite:', error);
      
      if (error.message.includes('duplicate key')) {
        toast({
          title: "Erro",
          description: "Este email já foi convidado para esta empresa",
          variant: "destructive"
        });
      } else if (error.message.includes('Company ID not found')) {
        // Já tratado acima, não precisa mostrar toast novamente
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível enviar o convite. Tente novamente.",
          variant: "destructive"
        });
      }
      throw error;
    }
  };

  const createN8nInvitation = async (email: string, roleId: string, sendEmail: boolean = true) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const webhookData = {
      email,
      role_id: roleId,
      send_email: sendEmail
    };

    const webhookUrl = 'https://n8n.weplataforma.com.br/webhook-test/c8c855c0-30be-4644-9996-6c208e58ecdf';
    
    console.log('🚀 Enviando para n8n:', webhookData);
    console.log('🌐 URL:', webhookUrl);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData)
    });

    console.log('📡 Status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Erro ${response.status}`);
    }

    console.log('✅ Enviado com sucesso');
  };

  const createNativeInvitation = async (email: string, roleId: string, sendEmail: boolean = true) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const { data, error } = await supabase.functions.invoke('invite-user', {
        body: {
          email,
          role_id: roleId,
          send_email: sendEmail
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Falha ao processar convite');
      }

      // Atualizar lista local
      setInvitations(prev => [data.invitation, ...prev]);
      
      toast({
        title: "Sucesso",
        description: data.message
      });
      
      return data.invitation;
    } catch (error: any) {
      console.error('Erro ao criar convite nativo:', error);
      
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar o convite. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const resendInvitation = async (invitationId: string) => {
    try {
      const invitation = invitations.find(inv => inv.id === invitationId);
      if (!invitation) {
        throw new Error('Convite não encontrado');
      }

      if (!invitation.sent_via_email) {
        throw new Error('Este convite não foi enviado por email');
      }

      await createNativeInvitation(invitation.email, invitation.role_id, true);
      
      toast({
        title: "Sucesso",
        description: "Convite reenviado com sucesso"
      });
    } catch (error: any) {
      console.error('Erro ao reenviar convite:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível reenviar o convite",
        variant: "destructive"
      });
    }
  };

  const deleteInvitation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_invitations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setInvitations(prev => prev.filter(inv => inv.id !== id));
      toast({
        title: "Sucesso",
        description: "Convite removido com sucesso"
      });
    } catch (error) {
      console.error('Erro ao remover convite:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o convite",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [user]);

  return {
    invitations,
    loading,
    createInvitation,
    createN8nInvitation,
    createNativeInvitation,
    resendInvitation,
    deleteInvitation,
    refetch: fetchInvitations
  };
};
