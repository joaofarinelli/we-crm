
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useSaasAdmin = () => {
  const [isSaasAdmin, setIsSaasAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkSaasAdmin = async () => {
      if (!user) {
        console.log('useSaasAdmin: No user logged in');
        setIsSaasAdmin(false);
        setLoading(false);
        return;
      }

      console.log('useSaasAdmin: Checking admin status for user:', user.id);

      try {
        // Use the updated function to check super admin status
        const { data, error } = await supabase.rpc('is_saas_admin');
        
        if (error) {
          console.error('useSaasAdmin: Error calling is_saas_admin RPC:', error);
          
          // Fallback: direct query for is_super_admin
          console.log('useSaasAdmin: Trying direct query fallback...');
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('is_super_admin')
            .eq('id', user.id)
            .single();

          if (profileError) {
            console.error('useSaasAdmin: Direct query failed:', profileError);
            setIsSaasAdmin(false);
          } else {
            const isAdmin = profileData?.is_super_admin || false;
            console.log('useSaasAdmin: Direct query result:', isAdmin);
            setIsSaasAdmin(isAdmin);
          }
        } else {
          console.log('useSaasAdmin: RPC result:', data);
          setIsSaasAdmin(data || false);
        }
        
      } catch (error) {
        console.error('Erro ao verificar admin SaaS:', error);
        setIsSaasAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkSaasAdmin();
  }, [user]);

  return { isSaasAdmin, loading };
};
