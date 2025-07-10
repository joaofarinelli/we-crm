-- Remover política atual que permite todos verem todos os leads da empresa
DROP POLICY IF EXISTS "Users can view their company leads" ON public.leads;

-- Criar nova política para admins verem todos os leads da empresa
CREATE POLICY "Admins can view all company leads" ON public.leads
FOR SELECT USING (
  company_id IN (
    SELECT profiles.company_id
    FROM profiles
    WHERE profiles.id = auth.uid()
  ) AND 
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() 
    AND r.name IN ('Admin', 'Gerente', 'SDR')
  )
);

-- Criar política para closers verem apenas seus leads atribuídos
CREATE POLICY "Closers can view assigned leads" ON public.leads
FOR SELECT USING (
  company_id IN (
    SELECT profiles.company_id
    FROM profiles
    WHERE profiles.id = auth.uid()
  ) AND 
  (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() 
      AND r.name IN ('Admin', 'Gerente', 'SDR')
    )
  )
);

-- Política para admins poderem atribuir/transferir leads
CREATE POLICY "Admins can update lead assignments" ON public.leads
FOR UPDATE USING (
  company_id IN (
    SELECT profiles.company_id
    FROM profiles
    WHERE profiles.id = auth.uid()
  ) AND 
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() 
    AND r.name IN ('Admin', 'Gerente')
  )
);