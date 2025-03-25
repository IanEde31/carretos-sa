# Documento Descritivo do Projeto: Carretos.sa

## 1. Introdução

**Visão Geral:**
O projeto Carretos.sa visa criar uma plataforma que conecta clientes que precisam de serviços de transporte (carreto) com motoristas disponíveis, através de um sistema gerenciado pela equipe interna da Carretos.sa.

**Escopo:**
O sistema será acessível por motoristas através de dispositivos móveis e pela equipe interna via um painel administrativo.

## 2. Descrição do Projeto

**Descrição Geral:**
A equipe da Carretos.sa deverá cadastrar solicitações de transporte recebidas. Após coletar as informações necessárias, a equipe lançará corridas no sistema, que serão visualizadas pelos motoristas. Os motoristas terão acesso a um feed de corridas compatíveis com seus veículos.

**Objetivos do Projeto:**
Facilitar a intermediação entre clientes e motoristas, otimizando o processo de gestão de solicitações e execução de serviços de transporte.

**Stakeholders:**
Motoristas, equipe de atendimento e administração Carretos.sa.

## 3. Requisitos Funcionais

**Funcionalidades Principais:**
- Sistema de cadastro e gerenciamento de corridas;
- Feed de corridas para motoristas com filtro baseado no tipo de veículo;
- Notificações para motoristas sobre novas corridas.

**User Stories:**
- Como membro da equipe Carretos.sa, quero registrar uma solicitação de carreto no sistema para que os motoristas possam visualizá-la.
- Como motorista, quero ser notificado de novas corridas que meu veículo pode realizar.
- Como motorista, quero acessar o feed de corridas e visualizar as corridas disponiveis

## 4. Requisitos Não Funcionais

**Desempenho:**
O sistema deve ser responsivo e suportar múltiplos acessos simultâneos.

**Segurança:**
Os dados dos clientes e motoristas devem ser protegidos.

**Usabilidade:**
A interface deve ser intuitiva para motoristas e a equipe de administração.

## 5. Arquitetura do Sistema

**Diagrama de Arquitetura:**
A plataforma será dividida em módulos para administração (equipe interna) e motoristas.

**Tecnologias Utilizadas:**
- Aplicativo web responsivo para a equipe interna;
- Aplicativo móvel para motoristas.
