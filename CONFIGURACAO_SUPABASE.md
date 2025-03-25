# Configuração do Supabase para o Carretos.sa

Este documento fornece instruções detalhadas sobre como configurar o Supabase para o sistema Carretos.sa. Siga os passos abaixo para configurar a autenticação e o banco de dados.

## Requisitos

- Conta no Supabase (gratuito): [https://supabase.com](https://supabase.com)
- Node.js instalado na sua máquina
- Projeto Carretos.sa clonado

## Passos para Configuração

### 1. Criar um Projeto no Supabase

1. Acesse [https://app.supabase.com](https://app.supabase.com) e faça login
2. Clique em "New Project"
3. Preencha os detalhes do projeto:
   - Nome: "Carretos.sa" (ou qualquer outro nome de sua preferência)
   - Database Password: escolha uma senha forte
   - Region: escolha a região mais próxima de você
4. Clique em "Create New Project"

### 2. Obter as Credenciais do Supabase

Após a criação do projeto, você precisa obter as seguintes credenciais:

1. Acesse a seção "Settings" > "API" no painel do Supabase
2. Copie os seguintes valores:
   - URL: `https://[seu-projeto-id].supabase.co`
   - anon/public key
   - service_role key (para configuração do banco de dados)

### 3. Configurar as Variáveis de Ambiente

1. Crie ou edite o arquivo `.env.local` na raiz do projeto Carretos.sa
2. Adicione as seguintes variáveis:

```
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
SUPABASE_SERVICE_KEY=sua_service_role_key
```

### 4. Configurar o Banco de Dados

Existem duas maneiras de configurar o banco de dados:

#### Método 1: Executar o SQL manualmente (Recomendado)

1. Execute o script que exporta o SQL para um arquivo temporário:

```bash
npm run exportar-sql
```

2. O script abrirá automaticamente um arquivo com o SQL necessário.
3. Copie todo o conteúdo deste arquivo.
4. No painel do Supabase, acesse "SQL Editor" e crie uma nova consulta (New query).
5. Cole o SQL copiado e clique em "Run".

#### Método 2: Tentar execução automática (Pode falhar)

```bash
npm run setup-db
```

> Nota: Este método tenta executar o SQL automaticamente através da API do Supabase, mas pode falhar devido a limitações da API.

Independentemente do método escolhido, o script vai criar todas as tabelas necessárias no Supabase, incluindo:
- motoristas
- solicitacoes
- corridas
- equipe

### 5. Criar o Primeiro Usuário Administrador

1. Execute o script para criar um administrador:

```bash
node create-admin-user.js
```

2. Siga as instruções para fornecer email, senha e nome para o usuário administrador

### 6. Habilitar a Autenticação por Email

1. No painel do Supabase, acesse "Authentication" > "Providers"
2. Certifique-se de que "Email" está habilitado
3. Opcional: Configure os templates de email para confirmação e recuperação de senha

### 7. Iniciar o Aplicativo

1. Inicie o aplicativo:

```bash
npm run dev
```

2. Acesse `http://localhost:3000/login` e faça login com as credenciais do administrador que você criou

## Configurações Adicionais

### Storage para Imagens (Opcional)

Se você precisar armazenar imagens no sistema:

1. No painel do Supabase, acesse "Storage"
2. Crie um novo bucket chamado "motoristas-fotos"
3. Configure as permissões do bucket

### Políticas de Segurança (Opcional)

Para personalizar as políticas de acesso aos dados:

1. No painel do Supabase, acesse "Authentication" > "Policies"
2. Ajuste as políticas para cada tabela conforme necessário

## Solução de Problemas

### Problemas de Autenticação

- Verifique se as variáveis de ambiente estão configuradas corretamente
- Certifique-se de que o usuário foi criado corretamente no Supabase

### Problemas com o Banco de Dados

- Verifique os logs do script de configuração
- Acesse o Editor SQL no painel do Supabase para executar consultas manualmente

## Recursos Adicionais

- [Documentação do Supabase](https://supabase.com/docs)
- [Autenticação com Supabase no Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Documentação de API do Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
