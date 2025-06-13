
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface ScriptAttachment {
  id: string;
  script_id: string;
  name: string;
  type: 'file' | 'link';
  url: string;
  file_size?: number;
  mime_type?: string;
  created_by: string;
  created_at: string;
}

export interface CreateAttachmentData {
  script_id: string;
  name: string;
  type: 'file' | 'link';
  url: string;
  file_size?: number;
  mime_type?: string;
}

export const useScriptAttachments = (scriptId?: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ['script-attachments', scriptId],
    queryFn: async () => {
      if (!scriptId) return [];
      
      const { data, error } = await supabase
        .from('script_attachments')
        .select('*')
        .eq('script_id', scriptId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ScriptAttachment[];
    },
    enabled: !!scriptId,
  });

  const uploadFile = useMutation({
    mutationFn: async (file: File) => {
      if (!user || !scriptId) throw new Error('Usuário não autenticado ou script não selecionado');
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('script-files')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('script-files')
        .getPublicUrl(fileName);
      
      const { data, error } = await supabase
        .from('script_attachments')
        .insert({
          script_id: scriptId,
          name: file.name,
          type: 'file',
          url: publicUrl,
          file_size: file.size,
          mime_type: file.type,
          created_by: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['script-attachments', scriptId] });
      toast.success('Arquivo enviado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao enviar arquivo:', error);
      toast.error('Erro ao enviar arquivo');
    },
  });

  const addLink = useMutation({
    mutationFn: async ({ name, url }: { name: string; url: string }) => {
      if (!user || !scriptId) throw new Error('Usuário não autenticado ou script não selecionado');
      
      const { data, error } = await supabase
        .from('script_attachments')
        .insert({
          script_id: scriptId,
          name,
          type: 'link',
          url,
          created_by: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['script-attachments', scriptId] });
      toast.success('Link adicionado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao adicionar link:', error);
      toast.error('Erro ao adicionar link');
    },
  });

  const deleteAttachment = useMutation({
    mutationFn: async (attachment: ScriptAttachment) => {
      // Se for um arquivo, deletar do storage também
      if (attachment.type === 'file') {
        const urlParts = attachment.url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `${user?.id}/${fileName}`;
        
        await supabase.storage
          .from('script-files')
          .remove([filePath]);
      }
      
      const { error } = await supabase
        .from('script_attachments')
        .delete()
        .eq('id', attachment.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['script-attachments', scriptId] });
      toast.success('Anexo removido com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao remover anexo:', error);
      toast.error('Erro ao remover anexo');
    },
  });

  return {
    attachments,
    isLoading,
    uploadFile,
    addLink,
    deleteAttachment,
  };
};
