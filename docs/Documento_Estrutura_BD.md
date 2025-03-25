# Documento da Estrutura do Banco de Dados - Carretos.sa

## 1. Introdução

Este documento descreve a arquitetura do banco de dados para o projeto Carretos.sa utilizando o Supabase, que possui como base o PostgreSQL. Ele detalha as principais tabelas, colunas e relacionamentos que irão suportar as funcionalidades do sistema, como o cadastro de solicitações de carreto, gerenciamento de corridas e administração por parte da equipe interna.

## 2. Tecnologia Utilizada

- **Plataforma:** Supabase
- **SGBD:** PostgreSQL

## 3. Estrutura das Tabelas

### 3.1. Tabela: `motoristas`

Esta tabela armazena as informações dos motoristas que utilizarão o aplicativo para visualizar e aceitar corridas.

**Colunas:**
- `id`: Identificador único do motorista (chave primária, serial).
- `nome`: Nome completo do motorista.
- `email`: Email de contato (deve ser único).
- `telefone`: Número para contato.
- `veiculo`: Informações sobre o veículo (marca, modelo, ano, etc.).
- `status`: Status do motorista (ativo, inativo, etc.).
- `data_cadastro`: Data em que o motorista foi cadastrado.

### 3.2. Tabela: `solicitacoes`

Esta tabela registra as solicitações de carreto recebidas via WhatsApp pela equipe da Carretos.sa.

**Colunas:**
- `id`: Identificador único da solicitação (chave primária, serial).
- `cliente_nome`: Nome do cliente que solicitou o carreto.
- `cliente_contato`: Contato (telefone, email, etc.) do cliente.
- `endereco_origem`: Endereço de partida.
- `endereco_destino`: Endereço de destino.
- `data_solicitacao`: Data e hora em que a solicitação foi recebida.
- `status`: Status da solicitação (pendente, em andamento, concluída, cancelada).

### 3.3. Tabela: `corridas`

Esta tabela faz a ligação entre as solicitações e os motoristas que aceitaram a corrida.

**Colunas:**
- `id`: Identificador único da corrida (chave primária, serial).
- `solicitacao_id`: Chave estrangeira referente à solicitação (relaciona-se com `solicitacoes.id`).
- `motorista_id`: Chave estrangeira referente ao motorista (relaciona-se com `motoristas.id`).
- `data_inicio`: Data e hora de início da corrida.
- `data_fim`: Data e hora de conclusão da corrida.
- `status`: Status da corrida (atribuída, em andamento, concluída, cancelada).

### 3.4. Tabela: `equipe`

Esta tabela registra os membros da equipe interna que gerenciam as solicitações e monitoram as corridas.

**Colunas:**
- `id`: Identificador único do usuário da equipe (chave primária, serial).
- `nome`: Nome completo do membro da equipe.
- `email`: Email de acesso (deve ser único).
- `senha`: Senha de acesso (armazenada em formato hash).
- `perfil`: Perfil de acesso (administrador, operador, etc.).
- `data_cadastro`: Data em que o usuário foi cadastrado.

## 4. Relacionamentos e Regras de Integridade

- Em `corridas`, o campo `solicitacao_id` é uma chave estrangeira que referencia `solicitacoes(id)`, garantindo que cada corrida esteja associada a uma solicitação existente.
- Em `corridas`, o campo `motorista_id` é uma chave estrangeira que referencia `motoristas(id)`, vinculando a corrida a um motorista.
- As colunas `email` nas tabelas `motoristas` e `equipe` devem ter restrição de unicidade para evitar duplicidade de informações de contato.
- Pode ser criada uma trigger ou função no PostgreSQL para atualizar automaticamente o status da solicitação ou corrida conforme mudanças em outras tabelas.

## 5. Possíveis Extensões

- Criação de tabelas de log para monitorar atividades e alterações realizadas nas solicitações e corridas.
- Implementação de views ou funções armazenadas para facilitar consultas complexas e relatórios.
- Integração com serviços externos para envio de notificações aos motoristas.

## 6. Conclusão

A estrutura proposta atende aos requisitos funcionais e não funcionais do projeto Carretos.sa, garantindo a integridade dos dados e facilitando a manutenção e escalabilidade do sistema. A utilização do Supabase permite aproveitar recursos avançados do PostgreSQL, ao mesmo tempo em que fornece uma interface moderna e segura para o gerenciamento do banco de dados.
