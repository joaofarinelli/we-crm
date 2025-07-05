
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CompanySettings {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  location: string | null;
  phone: string | null;
  plan: string | null;
  size: string | null;
  status: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export const useCompanySettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: company, isLoading } = useQuery({
    queryKey: ['company-settings'],
    queryFn: async () => {
      if (!user?.id) {
        console.log('No user ID found');
        throw new Error('User not authenticated');
      }

      console.log('Fetching company settings for user:', user.id);

      // Primeiro buscar o company_id do perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        throw new Error('Failed to fetch user profile: ' + profileError.message);
      }

      if (!profile?.company_id) {
        console.error('No company_id found in user profile');
        throw new Error('No company associated with user');
      }

      console.log('Found company_id:', profile.company_id);

      // Agora buscar os dados da empresa
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', profile.company_id)
        .single();

      if (error) {
        console.error('Error fetching company data:', error);
        throw new Error('Failed to fetch company data: ' + error.message);
      }

      console.log('Company data fetched successfully:', data);
      
      // Return the basic company data
      return data as CompanySettings;
    },
    enabled: !!user?.id,
  });

  const updateCompanyMutation = useMutation({
    mutationFn: async (updates: Partial<CompanySettings>) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      console.log('Updating company with data:', updates);

      // Primeiro buscar o company_id do perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.company_id) {
        console.error('Error fetching company_id:', profileError);
        throw new Error('Failed to get company ID');
      }

      const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', profile.company_id)
        .select()
        .single();

      if (error) {
        console.error('Error updating company:', error);
        throw new Error('Failed to update company: ' + error.message);
      }

      console.log('Company updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-settings'] });
    },
  });

  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      console.log('Starting logo upload for file:', file.name);

      // Primeiro buscar o company_id do perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.company_id) {
        console.error('Error fetching company_id:', profileError);
        throw new Error('Failed to get company ID');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.company_id}/logo.${fileExt}`;

      console.log('Uploading file to:', fileName);

      const { error: uploadError } = await supabase.storage
        .from('company-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw new Error('Failed to upload logo: ' + uploadError.message);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('company-assets')
        .getPublicUrl(fileName);

      console.log('File uploaded successfully, public URL:', publicUrl);

      // Update company with logo
      const { data, error } = await supabase
        .from('companies')
        .update({ website: publicUrl })  // Como não temos logo_url, vamos usar website temporariamente
        .eq('id', profile.company_id)
        .select()
        .single();

      if (error) {
        console.error('Error updating company with logo URL:', error);
        throw new Error('Failed to update company logo: ' + error.message);
      }

      console.log('Company logo updated successfully');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-settings'] });
    },
  });

  return {
    company,
    isLoading,
    updateCompany: updateCompanyMutation,
    uploadLogo: uploadLogoMutation,
    isUpdating: updateCompanyMutation.isPending,
    isUploadingLogo: uploadLogoMutation.isPending,
  };
};
