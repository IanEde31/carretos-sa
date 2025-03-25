-- Script para correção completa das políticas RLS e permissões no Supabase
-- Execute este script completo no SQL Editor do Supabase

-- 1. CONFIGURAÇÃO DAS POLÍTICAS DE TABELAS

-- Motoristas
-- Primeiro, removemos todas as políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Equipe pode visualizar motoristas" ON public.motoristas;
DROP POLICY IF EXISTS "Equipe pode gerenciar motoristas" ON public.motoristas;
DROP POLICY IF EXISTS "Equipe pode gerenciar documentos de motoristas" ON public.motoristas;

-- Criamos uma política única e abrangente que cobre todos os campos
CREATE POLICY "Equipe pode gerenciar todos dados de motoristas" 
ON public.motoristas FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Solicitações
DROP POLICY IF EXISTS "Equipe pode visualizar solicitacoes" ON public.solicitacoes;
DROP POLICY IF EXISTS "Equipe pode gerenciar solicitacoes" ON public.solicitacoes;
DROP POLICY IF EXISTS "Acesso às fotos de carga" ON public.solicitacoes;

CREATE POLICY "Equipe pode gerenciar todas solicitacoes" 
ON public.solicitacoes FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Corridas
DROP POLICY IF EXISTS "Equipe pode visualizar corridas" ON public.corridas;
DROP POLICY IF EXISTS "Equipe pode gerenciar corridas" ON public.corridas;
DROP POLICY IF EXISTS "Acesso às fotos de entrega" ON public.corridas;

CREATE POLICY "Equipe pode gerenciar todas corridas" 
ON public.corridas FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 2. CRIAÇÃO E CONFIGURAÇÃO DOS BUCKETS DE STORAGE

-- Criar buckets se não existirem
INSERT INTO storage.buckets (id, name, public)
VALUES ('perfil', 'perfil', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos', 'documentos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('corridas', 'corridas', true)
ON CONFLICT (id) DO NOTHING;

-- 3. CONFIGURAR POLÍTICAS DE ACESSO AOS OBJETOS DE STORAGE

-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Acesso público de leitura" ON storage.objects;
DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload" ON storage.objects;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar seus objetos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários autenticados podem remover seus objetos" ON storage.objects;

-- Política para permitir leitura pública
CREATE POLICY "Acesso público de leitura"
ON storage.objects FOR SELECT
USING (bucket_id IN ('perfil', 'documentos', 'corridas'));

-- Política para permitir upload por usuários autenticados
CREATE POLICY "Usuários autenticados podem fazer upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id IN ('perfil', 'documentos', 'corridas'));

-- Política para permitir atualização por usuários autenticados
CREATE POLICY "Usuários autenticados podem atualizar seus objetos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id IN ('perfil', 'documentos', 'corridas'));

-- Política para permitir exclusão por usuários autenticados
CREATE POLICY "Usuários autenticados podem remover seus objetos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id IN ('perfil', 'documentos', 'corridas'));

-- 4. VERIFICAR E AJUSTAR A ESTRUTURA DAS TABELAS PRINCIPAIS

-- Verificar motoristas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'motoristas' AND column_name = 'foto_perfil') THEN
    ALTER TABLE public.motoristas ADD COLUMN foto_perfil TEXT DEFAULT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'motoristas' AND column_name = 'documentos') THEN
    ALTER TABLE public.motoristas ADD COLUMN documentos JSONB DEFAULT '{"cnh": null, "identidade": null, "documento_veiculo": null}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'motoristas' AND column_name = 'capacidade_carga') THEN
    ALTER TABLE public.motoristas ADD COLUMN capacidade_carga DECIMAL(10, 2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'motoristas' AND column_name = 'area_atuacao') THEN
    ALTER TABLE public.motoristas ADD COLUMN area_atuacao TEXT DEFAULT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'motoristas' AND column_name = 'placa_veiculo') THEN
    ALTER TABLE public.motoristas ADD COLUMN placa_veiculo VARCHAR(20) DEFAULT NULL;
  END IF;
END $$;

-- Verificar solicitacoes
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'solicitacoes' AND column_name = 'fotos_carga') THEN
    ALTER TABLE public.solicitacoes ADD COLUMN fotos_carga TEXT[] DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'solicitacoes' AND column_name = 'tipo_veiculo_requerido') THEN
    ALTER TABLE public.solicitacoes ADD COLUMN tipo_veiculo_requerido VARCHAR(50) DEFAULT 'carro';
  END IF;
END $$;

-- Verificar corridas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'corridas' AND column_name = 'fotos_entrega') THEN
    ALTER TABLE public.corridas ADD COLUMN fotos_entrega TEXT[] DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'corridas' AND column_name = 'avaliacao') THEN
    ALTER TABLE public.corridas ADD COLUMN avaliacao INTEGER DEFAULT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'corridas' AND column_name = 'feedback') THEN
    ALTER TABLE public.corridas ADD COLUMN feedback TEXT DEFAULT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'corridas' AND column_name = 'distancia_km') THEN
    ALTER TABLE public.corridas ADD COLUMN distancia_km DECIMAL(10, 2) DEFAULT NULL;
  END IF;
END $$;

-- 5. HABILITAR ROW LEVEL SECURITY (RLS) PARA TODAS AS TABELAS
ALTER TABLE public.motoristas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corridas ENABLE ROW LEVEL SECURITY;

-- Tornar os buckets públicos para visualização
UPDATE storage.buckets SET public = true WHERE id IN ('perfil', 'documentos', 'corridas');

-- 6. VERIFICAR PERMISSÕES DE ROLES
-- Garantir que a role 'anon' tenha acesso ao bucket público para exibição de imagens
GRANT USAGE ON SCHEMA storage TO anon, authenticated;
GRANT SELECT ON storage.objects TO anon, authenticated;
GRANT SELECT ON storage.buckets TO anon, authenticated;

-- Dar permissões adicionais para usuários autenticados
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- 7. VERIFICAR TRIGGERS E FUNÇÕES
-- Nenhuma ação necessária para triggers neste momento

-- 8. AJUSTAR TEMPOS LIMITES DE CONSULTA
ALTER ROLE authenticated SET statement_timeout = '60s';
ALTER ROLE anon SET statement_timeout = '30s';
