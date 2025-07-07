-- Criar política RLS para permitir administradores deletarem usuários da mesma empresa
-- IMPORTANTE: Impedir auto-exclusão para evitar lock-out

CREATE POLICY "Admins can delete users from their company"
ON public.profiles
FOR DELETE
USING (
  -- Verificar se o usuário atual é admin
  public.is_current_user_admin() 
  AND 
  -- Verificar se o usuário a ser deletado é da mesma empresa
  company_id IN (
    SELECT company_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
  AND 
  -- CRÍTICO: Impedir que usuários deletem a si mesmos
  id != auth.uid()
);