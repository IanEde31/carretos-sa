# Carretos.sa

Plataforma para conectar clientes que precisam de serviços de transporte (carreto) com motoristas disponíveis.

## Módulos do Sistema

1. **Módulo de Administração**: Painel administrativo para a equipe interna gerenciar solicitações e motoristas
2. **Módulo para Motoristas**: Aplicativo móvel para motoristas visualizarem e aceitarem corridas

## Tecnologias Utilizadas

- **Frontend**: Next.js 14 com TypeScript
- **UI**: Tailwind CSS e Shadcn/UI
- **Backend/BD**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth

## Configuração do Projeto

### Requisitos

- Node.js 18+ 
- NPM 9+

### Instalação

```bash
# Clonar o repositório
git clone [url-do-repositorio]
cd carretos-sa

# Instalar dependências
npm install
```

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### Executando o Projeto

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start
```

## Estrutura do Projeto

```
carretos-sa/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── corridas/
│   │   │   ├── motoristas/
│   │   │   └── perfil/
│   │   └── api/
│   ├── components/
│   │   ├── auth/
│   │   ├── layout/
│   │   └── ui/
│   └── lib/
│       └── supabase/
└── public/
```

## Funcionalidades Principais

- **Autenticação**: Login/logout para equipe administrativa
- **Dashboard**: Visão geral das corridas, motoristas e métricas
- **Gerenciamento de Corridas**: Cadastro, visualização e edição de corridas
- **Gerenciamento de Motoristas**: Cadastro, visualização e edição de motoristas
- **Perfil de Usuário**: Gerenciamento das informações pessoais e senha

## Modelo de Banco de Dados

- **motoristas**: Armazena informações dos motoristas
- **solicitacoes**: Registra as solicitações de carreto recebidas
- **corridas**: Liga solicitações e motoristas
- **equipe**: Registra os membros da equipe interna
