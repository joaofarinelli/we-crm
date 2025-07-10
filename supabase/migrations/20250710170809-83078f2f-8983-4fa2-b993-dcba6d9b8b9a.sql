-- Criar tabela de metas de usuários
CREATE TABLE public.user_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_id UUID NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('vendas', 'agendamentos', 'conversoes', 'receita')),
  target_value NUMERIC NOT NULL DEFAULT 0,
  current_value NUMERIC NOT NULL DEFAULT 0,
  period TEXT NOT NULL DEFAULT 'mensal' CHECK (period IN ('mensal', 'trimestral', 'anual')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'pausada', 'concluida')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can view their company user goals" 
ON public.user_goals 
FOR SELECT 
USING (company_id IN (
  SELECT company_id FROM profiles WHERE id = auth.uid()
));

CREATE POLICY "Admins can create user goals for their company" 
ON public.user_goals 
FOR INSERT 
WITH CHECK (
  company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  ) AND 
  user_id IN (
    SELECT id FROM profiles WHERE company_id = (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  ) AND
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.name = 'Admin'
  )
);

CREATE POLICY "Admins can update user goals for their company" 
ON public.user_goals 
FOR UPDATE 
USING (
  company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  ) AND
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.name = 'Admin'
  )
);

CREATE POLICY "Admins can delete user goals for their company" 
ON public.user_goals 
FOR DELETE 
USING (
  company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  ) AND
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.name = 'Admin'
  )
);

-- Adicionar foreign keys
ALTER TABLE public.user_goals 
ADD CONSTRAINT user_goals_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.user_goals 
ADD CONSTRAINT user_goals_company_id_fkey 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.user_goals 
ADD CONSTRAINT user_goals_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Criar trigger para updated_at
CREATE TRIGGER update_user_goals_updated_at
BEFORE UPDATE ON public.user_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para calcular progresso automático das metas
CREATE OR REPLACE FUNCTION public.update_goal_progress()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Atualizar metas de vendas (leads com status "Vendido")
  UPDATE public.user_goals 
  SET current_value = (
    SELECT COUNT(*)
    FROM public.leads l
    WHERE l.assigned_to = user_goals.user_id
    AND l.status = 'Vendido'
    AND l.updated_at >= user_goals.start_date
    AND l.updated_at <= user_goals.end_date
    AND l.company_id = user_goals.company_id
  )
  WHERE goal_type = 'vendas' AND status = 'ativa';

  -- Atualizar metas de receita (soma do valor dos produtos vendidos)
  UPDATE public.user_goals 
  SET current_value = (
    SELECT COALESCE(SUM(l.product_value), 0)
    FROM public.leads l
    WHERE l.assigned_to = user_goals.user_id
    AND l.status = 'Vendido'
    AND l.updated_at >= user_goals.start_date
    AND l.updated_at <= user_goals.end_date
    AND l.company_id = user_goals.company_id
  )
  WHERE goal_type = 'receita' AND status = 'ativa';

  -- Atualizar metas de agendamentos
  UPDATE public.user_goals 
  SET current_value = (
    SELECT COUNT(*)
    FROM public.appointments a
    WHERE a.assigned_to = user_goals.user_id
    AND a.created_at >= user_goals.start_date
    AND a.created_at <= user_goals.end_date
    AND a.company_id = user_goals.company_id
  )
  WHERE goal_type = 'agendamentos' AND status = 'ativa';

  -- Marcar metas como concluídas se atingiram o target
  UPDATE public.user_goals 
  SET status = 'concluida'
  WHERE current_value >= target_value 
  AND status = 'ativa';
END;
$$;