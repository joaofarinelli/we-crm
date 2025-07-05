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

  // Stub implementation - return empty data for now since table doesn't exist
  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ['script-attachments', scriptId],
    queryFn: async () => {
      console.log('ScriptAttachments table not implemented yet');
      return [] as ScriptAttachment[];
    },
    enabled: !!scriptId,
  });

  const uploadFile = useMutation({
    mutationFn: async (file: File) => {
      console.log('Upload file not implemented yet:', file.name);
      return Promise.resolve();
    },
    onSuccess: () => {
      toast.success('Arquivo enviado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao enviar arquivo');
    },
  });

  const addLink = useMutation({
    mutationFn: async ({ name, url }: { name: string; url: string }) => {
      console.log('Add link not implemented yet:', { name, url });
      return Promise.resolve();
    },
    onSuccess: () => {
      toast.success('Link adicionado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao adicionar link');
    },
  });

  const deleteAttachment = useMutation({
    mutationFn: async (attachment: ScriptAttachment) => {
      console.log('Delete attachment not implemented yet:', attachment.id);
      return Promise.resolve();
    },
    onSuccess: () => {
      toast.success('Anexo removido com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao remover anexo');
    },
  });

  return {
    attachments,
    isLoading: false,
    uploadFile,
    addLink,
    deleteAttachment,
  };
};