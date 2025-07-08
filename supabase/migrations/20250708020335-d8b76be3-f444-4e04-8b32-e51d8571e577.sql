-- Add fields to support appointment rescheduling
ALTER TABLE public.appointments 
ADD COLUMN rescheduled_from_id UUID REFERENCES public.appointments(id),
ADD COLUMN reschedule_reason TEXT;

-- Add index for better performance when querying rescheduled appointments
CREATE INDEX idx_appointments_rescheduled_from ON public.appointments(rescheduled_from_id);