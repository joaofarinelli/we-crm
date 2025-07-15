-- Permitir que usuários vejam outros perfis da mesma empresa
CREATE POLICY "Users can view profiles from their company" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (company_id IN (
  SELECT company_id 
  FROM public.profiles 
  WHERE id = auth.uid()
));