-- Migração para adicionar novos campos nas tabelas

-- Adicionar campos para fotos de carga na tabela solicitacoes
ALTER TABLE public.solicitacoes 
ADD COLUMN IF NOT EXISTS fotos_carga TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tipo_veiculo_requerido VARCHAR(50) DEFAULT 'carro';

-- Adicionar campos para documentos na tabela motoristas
ALTER TABLE public.motoristas 
ADD COLUMN IF NOT EXISTS documentos JSONB DEFAULT '{"cnh": null, "identidade": null, "documento_veiculo": null}',
ADD COLUMN IF NOT EXISTS foto_perfil TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS capacidade_carga DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS area_atuacao TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS placa_veiculo VARCHAR(20) DEFAULT NULL;

-- Adicionar campos extras na tabela corridas
ALTER TABLE public.corridas
ADD COLUMN IF NOT EXISTS fotos_entrega TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS avaliacao INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS feedback TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS distancia_km DECIMAL(10, 2) DEFAULT NULL;

-- Atualizar políticas de segurança para novos campos
DROP POLICY IF EXISTS "Equipe pode gerenciar documentos de motoristas" ON public.motoristas;
CREATE POLICY "Equipe pode gerenciar documentos de motoristas" 
ON public.motoristas FOR ALL
TO authenticated
USING (true);

-- Criar políticas para acesso aos novos campos de fotos
DROP POLICY IF EXISTS "Acesso às fotos de carga" ON public.solicitacoes;
CREATE POLICY "Acesso às fotos de carga" 
ON public.solicitacoes FOR ALL
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Acesso às fotos de entrega" ON public.corridas;
CREATE POLICY "Acesso às fotos de entrega" 
ON public.corridas FOR ALL
TO authenticated
USING (true);

-- NOTA: Os buckets de storage devem ser criados manualmente na interface do Supabase:
-- 1. Bucket "perfil" para fotos de perfil dos motoristas
-- 2. Bucket "documentos" para documentos dos motoristas
-- 3. Bucket "corridas" para fotos de carga e entrega
