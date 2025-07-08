-- Atualizar constraint de outcome na tabela appointment_records para incluir "No Show"
ALTER TABLE public.appointment_records 
DROP CONSTRAINT appointment_records_outcome_check;

ALTER TABLE public.appointment_records 
ADD CONSTRAINT appointment_records_outcome_check 
CHECK (outcome = ANY (ARRAY['Fechou'::text, 'Não Fechou'::text, 'Aguardando'::text, 'Reagendar'::text, 'No Show'::text]));

-- Atualizar constraint de result na tabela follow_ups para incluir "No Show"
ALTER TABLE public.follow_ups 
DROP CONSTRAINT follow_ups_result_check;

ALTER TABLE public.follow_ups 
ADD CONSTRAINT follow_ups_result_check 
CHECK (result = ANY (ARRAY['Fechou'::text, 'Não Fechou'::text, 'Aguardando'::text, 'Sem Resposta'::text, 'Reagendar'::text, 'No Show'::text]));