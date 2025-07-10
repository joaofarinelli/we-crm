-- Configurar REPLICA IDENTITY FULL para tabelas que precisam de realtime
ALTER TABLE public.products REPLICA IDENTITY FULL;
ALTER TABLE public.partners REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.roles REPLICA IDENTITY FULL;
ALTER TABLE public.pipeline_columns REPLICA IDENTITY FULL;
ALTER TABLE public.lead_tags REPLICA IDENTITY FULL;
ALTER TABLE public.lead_tag_assignments REPLICA IDENTITY FULL;
ALTER TABLE public.follow_ups REPLICA IDENTITY FULL;
ALTER TABLE public.user_invitations REPLICA IDENTITY FULL;
ALTER TABLE public.meeting_agendas REPLICA IDENTITY FULL;
ALTER TABLE public.meeting_participants REPLICA IDENTITY FULL;
ALTER TABLE public.meeting_minutes REPLICA IDENTITY FULL;
ALTER TABLE public.meeting_attachments REPLICA IDENTITY FULL;
ALTER TABLE public.appointment_records REPLICA IDENTITY FULL;

-- Adicionar apenas as tabelas que ainda não estão na publicação supabase_realtime
DO $$
BEGIN
    -- Verifica se a tabela não está na publicação antes de adicionar
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'products') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'partners') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.partners;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'profiles') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'roles') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.roles;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'pipeline_columns') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.pipeline_columns;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'lead_tags') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.lead_tags;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'lead_tag_assignments') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.lead_tag_assignments;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'follow_ups') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.follow_ups;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'user_invitations') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.user_invitations;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'meeting_agendas') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.meeting_agendas;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'meeting_participants') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.meeting_participants;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'meeting_minutes') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.meeting_minutes;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'meeting_attachments') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.meeting_attachments;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'appointment_records') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.appointment_records;
    END IF;
END $$;