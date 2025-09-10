-- Fix search path for the sync_lead_status_with_pipeline function
CREATE OR REPLACE FUNCTION public.sync_lead_status_with_pipeline()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  valid_status TEXT;
  first_column_status TEXT;
BEGIN
  -- Check if the status exists in the company's pipeline columns
  SELECT name INTO valid_status
  FROM public.pipeline_columns 
  WHERE company_id = NEW.company_id 
    AND name = NEW.status
  LIMIT 1;
  
  -- If status is not valid, get the first column (lowest position) as default
  IF valid_status IS NULL THEN
    SELECT name INTO first_column_status
    FROM public.pipeline_columns 
    WHERE company_id = NEW.company_id 
    ORDER BY position ASC 
    LIMIT 1;
    
    -- Only change if we found a first column, otherwise leave as is
    IF first_column_status IS NOT NULL THEN
      NEW.status := first_column_status;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;