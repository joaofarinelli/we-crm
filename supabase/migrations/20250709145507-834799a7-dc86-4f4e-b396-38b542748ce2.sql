-- Corrigir leads com status NULL ou inválido
UPDATE leads 
SET status = (
  SELECT name FROM pipeline_columns 
  WHERE company_id = leads.company_id 
  AND position = 0 
  LIMIT 1
)
WHERE status IS NULL 
OR status NOT IN (
  SELECT name FROM pipeline_columns WHERE company_id = leads.company_id
);

-- Verificar se todas as empresas têm colunas do pipeline
DO $$
DECLARE
  company_record RECORD;
BEGIN
  FOR company_record IN 
    SELECT DISTINCT company_id FROM leads 
    WHERE company_id NOT IN (SELECT DISTINCT company_id FROM pipeline_columns)
  LOOP
    -- Criar colunas padrão para empresas que não têm
    PERFORM create_default_pipeline_columns(company_record.company_id);
  END LOOP;
END $$;

-- Executar novamente para leads que agora têm colunas
UPDATE leads 
SET status = (
  SELECT name FROM pipeline_columns 
  WHERE company_id = leads.company_id 
  AND position = 0 
  LIMIT 1
)
WHERE status IS NULL;