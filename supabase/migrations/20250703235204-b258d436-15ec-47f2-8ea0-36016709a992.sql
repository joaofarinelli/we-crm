-- Adicionar campos para suporte a convites nativos
ALTER TABLE public.user_invitations 
ADD COLUMN sent_via_email BOOLEAN DEFAULT false,
ADD COLUMN supabase_invite_id TEXT;

-- Criar configurações padrão para convites
INSERT INTO public.company_settings (company_id, setting_key, setting_value)
SELECT 
  id,
  'invitation_settings',
  '{"useNativeInvites": true, "redirectUrl": null, "defaultSendEmail": true}'::jsonb
FROM public.companies
WHERE NOT EXISTS (
  SELECT 1 FROM public.company_settings 
  WHERE company_id = companies.id 
  AND setting_key = 'invitation_settings'
);

-- Atualizar função handle_new_user para aceitar convites automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  default_role_id UUID;
  user_company_id UUID;
  user_domain TEXT;
  invitation_record RECORD;
BEGIN
  -- Verificar se existe convite pendente para este email
  SELECT * INTO invitation_record
  FROM public.user_invitations
  WHERE email = NEW.email
    AND expires_at > now()
    AND used_at IS NULL
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Se encontrou convite pendente, usar dados do convite
  IF invitation_record IS NOT NULL THEN
    user_company_id := invitation_record.company_id;
    default_role_id := invitation_record.role_id;
    
    -- Marcar convite como usado
    UPDATE public.user_invitations 
    SET used_at = now()
    WHERE id = invitation_record.id;
  ELSE
    -- Lógica original para novos usuários sem convite
    user_domain := split_part(NEW.email, '@', 2);
    
    SELECT id INTO user_company_id 
    FROM public.companies 
    WHERE domain = user_domain;
    
    IF user_company_id IS NULL THEN
      INSERT INTO public.companies (name, domain)
      VALUES (user_domain, user_domain)
      RETURNING id INTO user_company_id;
      
      PERFORM public.create_default_roles_for_company(user_company_id);
      PERFORM public.create_default_pipeline_columns(user_company_id);
      
      SELECT id INTO default_role_id 
      FROM public.roles 
      WHERE name = 'Admin' AND company_id = user_company_id 
      LIMIT 1;
    ELSE
      SELECT id INTO default_role_id 
      FROM public.roles 
      WHERE name = 'SDR' AND company_id = user_company_id 
      LIMIT 1;
    END IF;
  END IF;
  
  INSERT INTO public.profiles (id, email, full_name, role_id, company_id)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    default_role_id,
    user_company_id
  );
  
  RETURN NEW;
END;
$$;