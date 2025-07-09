-- Corrigir políticas RLS para permitir criação de empresas por usuários autenticados

-- Remover política conflitante se existir
DROP POLICY IF EXISTS "Users can create companies" ON public.companies;

-- Criar nova política mais permissiva para criação de empresas
CREATE POLICY "Authenticated users can create companies" 
ON public.companies 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Garantir que usuários podem atualizar suas próprias empresas
DROP POLICY IF EXISTS "Users can update their own company" ON public.companies;
CREATE POLICY "Users can update their own company"
ON public.companies 
FOR UPDATE 
TO authenticated 
USING (id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))