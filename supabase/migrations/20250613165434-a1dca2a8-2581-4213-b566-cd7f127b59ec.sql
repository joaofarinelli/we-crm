
-- Criar tabela para anexos dos materiais
CREATE TABLE public.script_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  script_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('file', 'link')),
  url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS
ALTER TABLE public.script_attachments ENABLE ROW LEVEL SECURITY;

-- Política para visualizar anexos da mesma empresa
CREATE POLICY "Users can view script attachments from their company" 
  ON public.script_attachments 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.scripts s 
      JOIN public.profiles p ON p.company_id = s.company_id 
      WHERE s.id = script_id AND p.id = auth.uid()
    )
  );

-- Política para criar anexos
CREATE POLICY "Users can create script attachments" 
  ON public.script_attachments 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.scripts s 
      JOIN public.profiles p ON p.company_id = s.company_id 
      WHERE s.id = script_id AND p.id = auth.uid()
    )
  );

-- Política para deletar anexos próprios
CREATE POLICY "Users can delete their own script attachments" 
  ON public.script_attachments 
  FOR DELETE 
  USING (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.scripts s 
      JOIN public.profiles p ON p.company_id = s.company_id 
      WHERE s.id = script_id AND p.id = auth.uid()
    )
  );

-- Criar bucket para arquivos dos materiais se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('script-files', 'script-files', true)
ON CONFLICT (id) DO NOTHING;

-- Política para upload de arquivos
CREATE POLICY "Users can upload script files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'script-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para visualizar arquivos
CREATE POLICY "Users can view script files"
ON storage.objects FOR SELECT
USING (bucket_id = 'script-files');

-- Política para deletar arquivos próprios
CREATE POLICY "Users can delete their own script files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'script-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
