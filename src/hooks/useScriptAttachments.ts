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

      if (error) {
        console.error('Error fetching script attachments:', error);
        throw error;
      }

      return data as ScriptAttachment[];
    },
    enabled: !!scriptId,
  });

  const uploadFile = useMutation({
    mutationFn: async ({ file, scriptId }: { file: File; scriptId: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('Arquivo muito grande. Tamanho máximo: 10MB');
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'image/gif',
        'text/plain'
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipo de arquivo não permitido');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('script-files')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Erro ao fazer upload do arquivo');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('script-files')
        .getPublicUrl(fileName);

      // Save attachment record
      const { data, error } = await supabase
        .from('script_attachments')
        .insert({
          script_id: scriptId,
          name: file.name,
          type: 'file',
          url: publicUrl,
          file_size: file.size,
          mime_type: file.type,
          created_by: user.id
        })
        .select()
        .single();

      if (error) {
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('script-files').remove([fileName]);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Arquivo enviado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['script-attachments', scriptId] });
    },
    onError: (error: Error) => {
      console.error('Upload error:', error);
      toast.error(error.message || 'Erro ao enviar arquivo');
    },
  });

  const addLink = useMutation({
    mutationFn: async ({ name, url, scriptId }: { name: string; url: string; scriptId: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Validate URL format
      try {
        new URL(url);
      } catch {
        throw new Error('URL inválida');
      }

      const { data, error } = await supabase
        .from('script_attachments')
        .insert({
          script_id: scriptId,
          name: name,
          type: 'link',
          url: url,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Link adicionado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['script-attachments', scriptId] });
    },
    onError: (error: Error) => {
      console.error('Add link error:', error);
      toast.error(error.message || 'Erro ao adicionar link');
    },
  });

  const deleteAttachment = useMutation({
    mutationFn: async (attachment: ScriptAttachment) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Delete from database
      const { error } = await supabase
        .from('script_attachments')
        .delete()
        .eq('id', attachment.id);

      if (error) throw error;

      // If it's a file, also delete from storage
      if (attachment.type === 'file' && attachment.url) {
        const urlParts = attachment.url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const fullPath = `${user.id}/${fileName}`;
        
        await supabase.storage
          .from('script-files')
          .remove([fullPath]);
      }
    },
    onSuccess: () => {
      toast.success('Anexo removido com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['script-attachments', scriptId] });
    },
    onError: (error: Error) => {
      console.error('Delete error:', error);
      toast.error(error.message || 'Erro ao remover anexo');
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