
-- Habilitar RLS na tabela roles se ainda não estiver habilitado
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Política para visualizar cargos (apenas da própria empresa + cargos do sistema)
CREATE POLICY "Users can view roles from their company or system roles" 
  ON public.roles 
  FOR SELECT 
  USING (
    is_system_role = true OR 
    company_id = get_current_user_company_id()
  );

-- Política para criar cargos (apenas para sua empresa)
CREATE POLICY "Users can create roles for their company" 
  ON public.roles 
  FOR INSERT 
  WITH CHECK (
    is_system_role = false AND 
    company_id = get_current_user_company_id()
  );

-- Política para atualizar cargos (apenas da própria empresa, não cargos do sistema)
CREATE POLICY "Users can update roles from their company" 
  ON public.roles 
  FOR UPDATE 
  USING (
    is_system_role = false AND 
    company_id = get_current_user_company_id()
  );

-- Política para deletar cargos (apenas da própria empresa, não cargos do sistema)
CREATE POLICY "Users can delete roles from their company" 
  ON public.roles 
  FOR DELETE 
  USING (
    is_system_role = false AND 
    company_id = get_current_user_company_id()
  );
