-- Mapear status antigos para colunas do pipeline
UPDATE leads 
SET status = CASE 
  WHEN status IN ('Quente', 'Morno', 'Frio', 'New') THEN (
    SELECT name FROM pipeline_columns 
    WHERE company_id = leads.company_id 
    AND position = 0 
    LIMIT 1
  )
  ELSE status
END
WHERE status NOT IN (
  SELECT name FROM pipeline_columns WHERE company_id = leads.company_id
) OR status IS NULL;

-- Executar novamente a sincronização para garantir consistência
SELECT sync_lead_status_with_pipeline();