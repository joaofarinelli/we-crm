-- Remover a coluna target_value da tabela partners
ALTER TABLE public.partners DROP COLUMN IF EXISTS target_value;