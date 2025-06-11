
-- Adicionar configurações de suporte WhatsApp na tabela companies
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS whatsapp_support JSONB DEFAULT '{"enabled": false, "phone": null, "message": "Olá! Preciso de ajuda."}'::jsonb;
