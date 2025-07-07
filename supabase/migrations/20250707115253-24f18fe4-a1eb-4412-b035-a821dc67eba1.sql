-- Criar tabela para configurações do sistema SaaS
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Policy para apenas admins SaaS poderem gerenciar configurações
CREATE POLICY "Only SaaS admins can manage system settings" 
  ON public.system_settings 
  FOR ALL 
  USING (public.is_saas_admin());

-- Inserir configurações iniciais
INSERT INTO public.system_settings (key, value, description) VALUES
  ('system.name', '"CRM System"', 'Nome do sistema'),
  ('system.maintenance_mode', 'false', 'Modo de manutenção'),
  ('system.maintenance_message', '"Sistema em manutenção. Tente novamente em alguns minutos."', 'Mensagem de manutenção'),
  ('plans.basic.limits', '{"users": 5, "leads_monthly": 100, "storage_gb": 1}', 'Limites do plano básico'),
  ('plans.pro.limits', '{"users": 25, "leads_monthly": 1000, "storage_gb": 10}', 'Limites do plano pro'),
  ('plans.enterprise.limits', '{"users": 100, "leads_monthly": 10000, "storage_gb": 100}', 'Limites do plano enterprise'),
  ('security.password_min_length', '8', 'Comprimento mínimo da senha'),
  ('security.session_timeout_hours', '24', 'Tempo de expiração da sessão em horas'),
  ('integrations.webhook_url', '""', 'URL do webhook principal'),
  ('integrations.smtp_server', '""', 'Servidor SMTP para emails');

-- Trigger para atualizar updated_at
CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();