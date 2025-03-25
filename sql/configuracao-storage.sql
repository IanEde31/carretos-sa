-- Script para criar e configurar buckets no Storage do Supabase

-- Criar buckets se não existirem (precisa ser executado manualmente no SQL Editor do Supabase)
-- Bucket para fotos de perfil
INSERT INTO storage.buckets (id, name, public)
VALUES ('perfil', 'perfil', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket para documentos
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos', 'documentos', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket para corridas (fotos de carga e entrega)
INSERT INTO storage.buckets (id, name, public)
VALUES ('corridas', 'corridas', true)
ON CONFLICT (id) DO NOTHING;

-- Configurar políticas de segurança para os buckets
-- Permitir acesso público de leitura a todos os objetos nos buckets

-- Políticas para o bucket 'perfil'
BEGIN;
  -- Remover políticas existentes para evitar conflitos
  DROP POLICY IF EXISTS "Acesso público de leitura" ON storage.objects FOR SELECT;
  DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload" ON storage.objects FOR INSERT;
  DROP POLICY IF EXISTS "Usuários autenticados podem atualizar seus objetos" ON storage.objects FOR UPDATE;
  DROP POLICY IF EXISTS "Usuários autenticados podem remover seus objetos" ON storage.objects FOR DELETE;

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
COMMIT;

-- Configurar roles e permissões
ALTER ROLE authenticated SET statement_timeout = '60s';
ALTER ROLE anon SET statement_timeout = '30s';
