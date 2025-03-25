-- Criação das tabelas para o projeto Carretos.sa

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela: motoristas
CREATE TABLE IF NOT EXISTS motoristas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    veiculo JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ativo',
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: solicitacoes
CREATE TABLE IF NOT EXISTS solicitacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_nome VARCHAR(255) NOT NULL,
    cliente_contato VARCHAR(255) NOT NULL,
    endereco_origem TEXT NOT NULL,
    endereco_destino TEXT NOT NULL,
    descricao TEXT,
    data_solicitacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) NOT NULL DEFAULT 'pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: corridas
CREATE TABLE IF NOT EXISTS corridas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    solicitacao_id UUID NOT NULL REFERENCES solicitacoes(id) ON DELETE CASCADE,
    motorista_id UUID REFERENCES motoristas(id) ON DELETE SET NULL,
    data_inicio TIMESTAMP WITH TIME ZONE,
    data_fim TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'atribuída',
    valor DECIMAL(10, 2),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: equipe (para usuários do sistema administrativo)
CREATE TABLE IF NOT EXISTS equipe (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE,  -- Referência ao ID do usuário no auth.users do Supabase
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    perfil VARCHAR(50) NOT NULL DEFAULT 'operador',  -- administrador, operador, etc.
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Função para atualizar o timestamp 'updated_at'
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o campo 'updated_at' em todas as tabelas
CREATE TRIGGER update_motoristas_updated_at
    BEFORE UPDATE ON motoristas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_solicitacoes_updated_at
    BEFORE UPDATE ON solicitacoes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_corridas_updated_at
    BEFORE UPDATE ON corridas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipe_updated_at
    BEFORE UPDATE ON equipe
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) para proteger os dados
ALTER TABLE motoristas ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE corridas ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipe ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para membros da equipe administrativa
CREATE POLICY "Equipe pode visualizar todos os motoristas" 
ON motoristas FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Equipe pode editar todos os motoristas" 
ON motoristas FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Equipe pode inserir motoristas" 
ON motoristas FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Equipe pode visualizar todas as solicitações" 
ON solicitacoes FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Equipe pode editar todas as solicitações" 
ON solicitacoes FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Equipe pode inserir solicitações" 
ON solicitacoes FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Equipe pode visualizar todas as corridas" 
ON corridas FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Equipe pode editar todas as corridas" 
ON corridas FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Equipe pode inserir corridas" 
ON corridas FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Equipe pode visualizar perfis da equipe" 
ON equipe FOR SELECT 
USING (auth.role() = 'authenticated');

-- Função para sincronizar usuários do auth.users com a tabela equipe
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.equipe (auth_id, nome, email, perfil)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'), NEW.email, 'operador');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para sincronizar novos usuários
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Adicionar usuário administrador para iniciar o sistema
-- Você precisará criar este usuário através da interface do Supabase ou API
