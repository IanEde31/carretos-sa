-- Script para adicionar campos detalhados às tabelas solicitacoes
-- Execução: 28/04/2025

-- Campos de cliente
ALTER TABLE public.solicitacoes ADD COLUMN IF NOT EXISTS cliente_email VARCHAR(255);
ALTER TABLE public.solicitacoes ADD COLUMN IF NOT EXISTS cliente_empresa VARCHAR(255);

-- Campos detalhados para endereço de origem
ALTER TABLE public.solicitacoes ADD COLUMN IF NOT EXISTS cep_origem VARCHAR(9);
ALTER TABLE public.solicitacoes ADD COLUMN IF NOT EXISTS numero_origem VARCHAR(20);
ALTER TABLE public.solicitacoes ADD COLUMN IF NOT EXISTS complemento_origem VARCHAR(255);
ALTER TABLE public.solicitacoes ADD COLUMN IF NOT EXISTS bairro_origem VARCHAR(255);
ALTER TABLE public.solicitacoes ADD COLUMN IF NOT EXISTS cidade_origem VARCHAR(255);
ALTER TABLE public.solicitacoes ADD COLUMN IF NOT EXISTS estado_origem VARCHAR(2);
ALTER TABLE public.solicitacoes ADD COLUMN IF NOT EXISTS ponto_referencia_origem TEXT;

-- Campos detalhados para endereço de destino
ALTER TABLE public.solicitacoes ADD COLUMN IF NOT EXISTS cep_destino VARCHAR(9);
ALTER TABLE public.solicitacoes ADD COLUMN IF NOT EXISTS numero_destino VARCHAR(20);
ALTER TABLE public.solicitacoes ADD COLUMN IF NOT EXISTS complemento_destino VARCHAR(255);
ALTER TABLE public.solicitacoes ADD COLUMN IF NOT EXISTS bairro_destino VARCHAR(255);
ALTER TABLE public.solicitacoes ADD COLUMN IF NOT EXISTS cidade_destino VARCHAR(255);
ALTER TABLE public.solicitacoes ADD COLUMN IF NOT EXISTS estado_destino VARCHAR(2);
ALTER TABLE public.solicitacoes ADD COLUMN IF NOT EXISTS ponto_referencia_destino TEXT;

-- Campos adicionais para carga
ALTER TABLE public.solicitacoes ADD COLUMN IF NOT EXISTS dimensoes VARCHAR(255);
ALTER TABLE public.solicitacoes ADD COLUMN IF NOT EXISTS peso_aproximado VARCHAR(255);
ALTER TABLE public.solicitacoes ADD COLUMN IF NOT EXISTS quantidade_itens VARCHAR(255);
ALTER TABLE public.solicitacoes ADD COLUMN IF NOT EXISTS valor NUMERIC(10, 2);
ALTER TABLE public.solicitacoes ADD COLUMN IF NOT EXISTS observacoes TEXT;
ALTER TABLE public.solicitacoes ADD COLUMN IF NOT EXISTS data_retirada TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.solicitacoes ADD COLUMN IF NOT EXISTS horario_retirada VARCHAR(255);

-- Comentário nas colunas para documentação
COMMENT ON COLUMN public.solicitacoes.cliente_email IS 'Email do cliente para contato';
COMMENT ON COLUMN public.solicitacoes.cliente_empresa IS 'Empresa do cliente (opcional)';
COMMENT ON COLUMN public.solicitacoes.valor IS 'Valor estimado para a corrida';
COMMENT ON COLUMN public.solicitacoes.data_retirada IS 'Data preferencial para retirada';
COMMENT ON COLUMN public.solicitacoes.horario_retirada IS 'Período do dia preferencial para retirada';
