-- Configurar REPLICA IDENTITY FULL para tabelas que precisam de realtime
ALTER TABLE public.products REPLICA IDENTITY FULL;
ALTER TABLE public.partners REPLICA IDENTITY FULL;
ALTER TABLE public.companies REPLICA IDENTITY FULL;
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

-- Adicionar todas as tabelas à publicação supabase_realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.partners;
ALTER PUBLICATION supabase_realtime ADD TABLE public.companies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.roles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pipeline_columns;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lead_tags;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lead_tag_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.follow_ups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_invitations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meeting_agendas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meeting_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meeting_minutes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meeting_attachments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointment_records;