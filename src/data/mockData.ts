// Dados fictícios para desenvolvimento sem Supabase

// Equipe
export const mockTeamMembers = [
  {
    id: 1,
    nome: 'Admin',
    email: 'admin@carretos.com',
    cargo: 'Administrador',
    telefone: '(11) 98765-4321',
    foto_url: 'https://i.pravatar.cc/150?img=1',
    data_cadastro: '2024-01-01',
  },
  {
    id: 2,
    nome: 'Maria Silva',
    email: 'maria@carretos.com',
    cargo: 'Atendente',
    telefone: '(11) 91234-5678',
    foto_url: 'https://i.pravatar.cc/150?img=5',
    data_cadastro: '2024-01-02',
  },
];

// Motoristas
export const mockDrivers = [
  {
    id: 1,
    nome: 'João Pereira',
    telefone: '(11) 92222-3333',
    email: 'joao@email.com',
    cpf: '123.456.789-00',
    cnh: 'ABC1234567',
    categoria_cnh: 'B',
    data_nascimento: '1985-05-15',
    veiculo: 'Fiat Fiorino',
    placa: 'ABC1234',
    status: 'ativo',
    foto_url: 'https://i.pravatar.cc/150?img=10',
    data_cadastro: '2024-01-10',
  },
  {
    id: 2,
    nome: 'Carlos Santos',
    telefone: '(11) 94444-5555',
    email: 'carlos@email.com',
    cpf: '987.654.321-00',
    cnh: 'XYZ7654321',
    categoria_cnh: 'C',
    data_nascimento: '1990-08-20',
    veiculo: 'VW Saveiro',
    placa: 'XYZ5678',
    status: 'ativo',
    foto_url: 'https://i.pravatar.cc/150?img=11',
    data_cadastro: '2024-01-15',
  },
  {
    id: 3,
    nome: 'Ana Oliveira',
    telefone: '(11) 96666-7777',
    email: 'ana@email.com',
    cpf: '111.222.333-44',
    cnh: 'DEF9876543',
    categoria_cnh: 'B',
    data_nascimento: '1988-03-10',
    veiculo: 'Renault Kangoo',
    placa: 'DEF9876',
    status: 'inativo',
    foto_url: 'https://i.pravatar.cc/150?img=12',
    data_cadastro: '2024-01-20',
  },
];

// Solicitações
export const mockRequests = [
  {
    id: 1,
    nome_cliente: 'Fernando Costa',
    telefone_cliente: '(11) 98888-9999',
    email_cliente: 'fernando@email.com',
    endereco_origem: 'Av. Paulista, 1000, São Paulo, SP',
    endereco_destino: 'Rua Augusta, 500, São Paulo, SP',
    data_solicitacao: '2024-03-10',
    status: 'pendente',
    observacoes: 'Móveis pequenos, precisa de ajuda para carregar',
  },
  {
    id: 2,
    nome_cliente: 'Patricia Lima',
    telefone_cliente: '(11) 97777-8888',
    email_cliente: 'patricia@email.com',
    endereco_origem: 'Rua Oscar Freire, 200, São Paulo, SP',
    endereco_destino: 'Alameda Santos, 800, São Paulo, SP',
    data_solicitacao: '2024-03-12',
    status: 'confirmada',
    observacoes: 'Transporte de eletrodomésticos',
  },
  {
    id: 3,
    nome_cliente: 'Roberto Alves',
    telefone_cliente: '(11) 96666-5555',
    email_cliente: 'roberto@email.com',
    endereco_origem: 'Rua Consolação, 300, São Paulo, SP',
    endereco_destino: 'Av. Rebouças, 900, São Paulo, SP',
    data_solicitacao: '2024-03-15',
    status: 'cancelada',
    observacoes: 'Cliente cancelou o pedido',
  },
];

// Corridas
export const mockRides = [
  {
    id: 1,
    motorista_id: 1,
    solicitacao_id: 1,
    data_inicio: '2024-03-10 14:00',
    data_fim: '2024-03-10 16:30',
    valor: 150.0,
    status: 'concluída',
    avaliacao: 5,
    comentario: 'Excelente serviço, pontual e cuidadoso',
  },
  {
    id: 2,
    motorista_id: 2,
    solicitacao_id: 2,
    data_inicio: '2024-03-12 10:00',
    data_fim: null,
    valor: 120.0,
    status: 'em andamento',
    avaliacao: null,
    comentario: null,
  },
  {
    id: 3,
    motorista_id: 1,
    solicitacao_id: 3,
    data_inicio: '2024-03-15 09:00',
    data_fim: null,
    valor: 100.0,
    status: 'cancelada',
    avaliacao: null,
    comentario: 'Cliente cancelou antes do início',
  },
  {
    id: 4,
    motorista_id: 3,
    solicitacao_id: 1,
    data_inicio: '2024-03-16 11:00',
    data_fim: '2024-03-16 13:30',
    valor: 180.0,
    status: 'concluída',
    avaliacao: 4,
    comentario: 'Bom serviço, mas um pouco atrasado',
  },
];

// Métricas para o Dashboard
export const mockMetrics = {
  total_motoristas: 3,
  motoristas_ativos: 2,
  total_corridas: 4,
  corridas_concluidas: 2,
  corridas_em_andamento: 1,
  corridas_canceladas: 1,
  faturamento_total: 450.0,
  faturamento_mes_atual: 450.0,
  avaliacao_media: 4.5,
};

// Usuário atual para simular autenticação
export const mockCurrentUser = {
  id: 1,
  nome: 'Admin',
  email: 'admin@carretos.com',
  cargo: 'Administrador',
  foto_url: 'https://i.pravatar.cc/150?img=1',
};
