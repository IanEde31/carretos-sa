'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardMetrics, getUltimasCorridas, getMotoristasAtivos } from '@/lib/supabase/dashboard';
import { Loader2, AlertTriangle, Info, X, PhoneCall, Mail, Calendar, MapPin, Truck, Car, Clock, User } from 'lucide-react';
import { type Corrida } from '@/lib/supabase/corridas';
import { type Motorista } from '@/lib/supabase/motoristas';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import AuthDebug from '@/components/auth-debug';
import { testConnection, checkAuth } from '@/lib/supabase/config';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { toast } = useToast();
  const [metrics, setMetrics] = useState({
    total_motoristas: 0,
    motoristas_ativos: 0,
    total_corridas: 0,
    corridas_concluidas: 0,
    corridas_em_andamento: 0,
    corridas_canceladas: 0,
    faturamento_total: 0,
    faturamento_mes_atual: 0,
    avaliacao_media: 0
  });
  const [rides, setRides] = useState<Corrida[]>([]);
  const [drivers, setDrivers] = useState<Motorista[]>([]);
  const [showAuthDebug, _] = useState(false); // Desativado para evitar poluição visual
  
  // Estados para os modais de detalhes
  const [selectedRide, setSelectedRide] = useState<Corrida | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Motorista | null>(null);
  const [rideModalOpen, setRideModalOpen] = useState(false);
  const [driverModalOpen, setDriverModalOpen] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true);

        // Verificar autenticação primeiro
        console.log('Verificando status da autenticação...');
        await checkAuth();

        // Testar conexão com o Supabase
        console.log('Testando conexão com o Supabase...');
        const connectionTest = await testConnection();
        
        if (!connectionTest.success) {
          console.error('Teste de conexão falhou:', connectionTest.error);
          setConnectionError('Erro na conexão com o banco de dados. Verifique o console para mais detalhes.');
          setIsLoading(false);
          return;
        }
        
        console.log('Conexão com Supabase confirmada, carregando dados...');
        
        // Buscar métricas
        const metricsData = await getDashboardMetrics();
        setMetrics(metricsData);
        
        // Buscar últimas corridas
        const corridasData = await getUltimasCorridas(4);
        setRides(corridasData);
        
        // Buscar motoristas ativos
        const motoristasData = await getMotoristasAtivos(4);
        setDrivers(motoristasData);

        // Exibir toast de sucesso
        toast({
          title: "Dados carregados",
          description: "Os dados do dashboard foram carregados com sucesso!",
        });
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        
        if (error instanceof Error) {
          setConnectionError(`Erro: ${error.message}`);
        } else {
          setConnectionError('Ocorreu um erro desconhecido. Verifique o console para mais detalhes.');
        }
        
        // Exibir toast de erro
        toast({
          title: "Erro ao carregar dados",
          description: "Ocorreu um erro ao carregar os dados do dashboard.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadDashboardData();
  }, [toast]);

  // Função removida

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-8 items-center justify-center min-h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-gray-500">Carregando dashboard...</p>
      </div>
    );
  }
  
  if (connectionError) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-8 items-center justify-center min-h-[70vh]">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-bold text-destructive">Erro de Conexão</h2>
        <p className="text-gray-500 text-center max-w-md">{connectionError}</p>
        <div className="mt-4 p-4 bg-white rounded-md">
          <h3 className="font-semibold mb-2">Possíveis soluções:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Verifique se as variáveis de ambiente estão configuradas no Vercel</li>
            <li>Confirme se as políticas RLS do Supabase permitem acesso aos dados</li>
            <li>Verifique se as tabelas existem no banco de dados</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-gray-500">
            Visão geral do sistema Carretos.sa
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4 w-full max-w-md grid grid-cols-2 h-auto">
          <TabsTrigger value="overview" className="py-2">Visão Geral</TabsTrigger>
          <TabsTrigger value="statistics" className="py-2">Estatísticas</TabsTrigger>
        </TabsList>
        
        {/* Conteúdo da aba Visão Geral */}
        <TabsContent value="overview" className="space-y-4">
          {/* Cards de Métricas */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Corridas Totais
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-gray-500"
                >
                  <path d="M16 3h5v5" />
                  <path d="M21 3l-7 7" />
                  <path d="M3 8v8a5 5 0 0 0 5 5h8" />
                  <path d="m13 9 6 6" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.total_corridas}</div>
                <p className="text-xs text-gray-500">
                  +{Math.floor(Math.random() * 20)}% em relação ao mês anterior
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Motoristas Cadastrados
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-gray-500"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.total_motoristas}</div>
                <p className="text-xs text-gray-500">
                  {metrics.motoristas_ativos} motoristas ativos
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Faturamento Total
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-gray-500"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {metrics.faturamento_total.toFixed(2)}
                </div>
                <p className="text-xs text-gray-500">
                  +{Math.floor(Math.random() * 15)}% em relação ao ano anterior
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avaliação Média
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-gray-500"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.avaliacao_media.toFixed(1)}</div>
                <p className="text-xs text-gray-500">
                  {metrics.corridas_concluidas} avaliações
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Cards de Corridas e Motoristas */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Últimas Corridas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rides.length > 0 ? (
                    rides.map((ride) => (
                      <div 
                        key={ride.id} 
                        className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedRide(ride);
                          setRideModalOpen(true);
                        }}
                      >
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <Car className="h-4 w-4" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {ride.solicitacao?.endereco_origem || 'Origem não definida'} → {ride.solicitacao?.endereco_destino || 'Destino não definido'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {ride.valor ? `R$ ${ride.valor.toFixed(2)}` : 'Valor não definido'}
                          </p>
                        </div>
                        <div className="ml-auto text-xs text-right">
                          <p>{new Date(ride.data_inicio || ride.created_at || '').toLocaleDateString('pt-BR')}</p>
                          <p className={`font-medium ${
                            ride.status === 'finalizada' ? 'text-green-500' : 
                            ride.status === 'em andamento' ? 'text-blue-500' : 
                            'text-yellow-500'
                          }`}>
                            {ride.status}
                          </p>
                        </div>
                        <Info className="ml-2 h-4 w-4 text-gray-500" />
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">Nenhuma corrida registrada</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Motoristas Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {drivers.length > 0 ? (
                    drivers.map((driver) => (
                      <div 
                        key={driver.id} 
                        className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedDriver(driver);
                          setDriverModalOpen(true);
                        }}
                      >
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <Truck className="h-4 w-4" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {driver.nome}
                          </p>
                          <p className="text-xs text-gray-500">
                            {typeof driver.veiculo === 'object' 
                              ? driver.veiculo?.descricao || '' 
                              : (typeof driver.veiculo === 'string' ? driver.veiculo : '')}
                          </p>
                        </div>
                        <div className="ml-auto text-xs text-right">
                          <p>{new Date(driver.data_cadastro || driver.created_at || '').toLocaleDateString('pt-BR')}</p>
                          <p className="font-medium text-green-500">
                            {driver.status}
                          </p>
                        </div>
                        <Info className="ml-2 h-4 w-4 text-gray-500" />
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">Nenhum motorista ativo</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Conteúdo da aba Estatísticas */}
        <TabsContent value="statistics" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {/* Card de Estatísticas de Corridas */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de Corridas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Status das Corridas</h3>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
                      <div className="flex h-4 overflow-hidden rounded-full text-xs">
                        <div 
                          style={{ width: `${metrics.corridas_concluidas / Math.max(metrics.total_corridas, 1) * 100}%` }} 
                          className="bg-green-500 flex items-center justify-center h-full text-white shadow-none whitespace-nowrap overflow-hidden"
                        >
                          {metrics.total_corridas > 0 ? `${Math.round(metrics.corridas_concluidas / metrics.total_corridas * 100)}%` : ''}
                        </div>
                        <div 
                          style={{ width: `${metrics.corridas_em_andamento / Math.max(metrics.total_corridas, 1) * 100}%` }} 
                          className="bg-blue-500 flex items-center justify-center h-full text-white shadow-none whitespace-nowrap overflow-hidden"
                        >
                          {metrics.total_corridas > 0 ? `${Math.round(metrics.corridas_em_andamento / metrics.total_corridas * 100)}%` : ''}
                        </div>
                        <div 
                          style={{ width: `${metrics.corridas_canceladas / Math.max(metrics.total_corridas, 1) * 100}%` }} 
                          className="bg-red-500 flex items-center justify-center h-full text-white shadow-none whitespace-nowrap overflow-hidden"
                        >
                          {metrics.total_corridas > 0 ? `${Math.round(metrics.corridas_canceladas / metrics.total_corridas * 100)}%` : ''}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                        <span>Concluídas ({metrics.corridas_concluidas})</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                        <span>Em andamento ({metrics.corridas_em_andamento})</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                        <span>Canceladas ({metrics.corridas_canceladas})</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Estatísticas de Valores</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-100 p-3 rounded-md">
                        <p className="text-xs text-gray-500">Valor médio por corrida</p>
                        <p className="text-lg font-bold">
                          R$ {metrics.corridas_concluidas > 0 ? (metrics.faturamento_total / metrics.corridas_concluidas).toFixed(2) : '0.00'}
                        </p>
                      </div>
                      <div className="bg-gray-100 p-3 rounded-md">
                        <p className="text-xs text-gray-500">Avaliação média</p>
                        <div className="flex items-center">
                          <p className="text-lg font-bold mr-1">{metrics.avaliacao_media.toFixed(1)}</p>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-500">
                            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card de Desempenho Financeiro */}
            <Card>
              <CardHeader>
                <CardTitle>Desempenho Financeiro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Faturamento</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-100 p-3 rounded-md">
                        <p className="text-xs text-gray-500">Faturamento Total</p>
                        <p className="text-lg font-bold">
                          R$ {metrics.faturamento_total.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-gray-100 p-3 rounded-md">
                        <p className="text-xs text-gray-500">Mês Atual</p>
                        <p className="text-lg font-bold">
                          R$ {metrics.faturamento_mes_atual.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Comparativo Mensal</h3>
                    <div className="h-40 w-full">
                      <div className="flex justify-between h-full items-end">
                        {Array.from({ length: 6 }).map((_, index) => {
                          const randomHeight = 20 + Math.random() * 80;
                          const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
                          return (
                            <div key={index} className="flex flex-col items-center w-full">
                              <div 
                                className="w-4/5 bg-primary rounded-t" 
                                style={{ height: `${randomHeight}%` }}
                              ></div>
                              <p className="text-xs mt-1 text-gray-500">{months[index]}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <p className="text-xs text-center mt-2 text-gray-500">Faturamento dos últimos 6 meses (simulação)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card de Estatísticas de Motoristas */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Estatísticas de Motoristas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Distribuição de Motoristas por Status</h3>
                    <div className="flex items-center justify-center space-x-4">
                      <div className="flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full border-8 border-primary flex items-center justify-center">
                          <span className="text-xl font-bold">{metrics.motoristas_ativos}</span>
                        </div>
                        <p className="text-sm mt-2">Ativos</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full border-8 border-gray-300 flex items-center justify-center">
                          <span className="text-xl font-bold">{metrics.total_motoristas - metrics.motoristas_ativos}</span>
                        </div>
                        <p className="text-sm mt-2">Inativos</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="bg-gray-100 p-3 rounded-md text-center">
                      <p className="text-xs text-gray-500">Média de Corridas por Motorista</p>
                      <p className="text-lg font-bold">
                        {metrics.motoristas_ativos > 0 ? (metrics.total_corridas / metrics.motoristas_ativos).toFixed(1) : '0'}
                      </p>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-md text-center">
                      <p className="text-xs text-gray-500">Taxa de Conclusão</p>
                      <p className="text-lg font-bold">
                        {metrics.total_corridas > 0 ? `${Math.round(metrics.corridas_concluidas / metrics.total_corridas * 100)}%` : '0%'}
                      </p>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-md text-center">
                      <p className="text-xs text-gray-500">Faturamento por Motorista</p>
                      <p className="text-lg font-bold">
                        R$ {metrics.motoristas_ativos > 0 ? (metrics.faturamento_total / metrics.motoristas_ativos).toFixed(2) : '0.00'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      {showAuthDebug && <AuthDebug />}

      {/* Modal de Detalhes da Corrida */}
      <Dialog open={rideModalOpen} onOpenChange={setRideModalOpen}>
        <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto bg-white border shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" /> Detalhes da Corrida
            </DialogTitle>
            <DialogDescription>
              Informações completas sobre a corrida selecionada
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4">
            {selectedRide && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-sm">Cliente</h3>
                      <p className="text-sm flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        {selectedRide.solicitacao?.cliente_nome || 'Não informado'}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-sm">Contato</h3>
                      <p className="text-sm flex items-center gap-2">
                        <PhoneCall className="h-4 w-4 text-gray-500" />
                        {selectedRide.solicitacao?.cliente_contato || 'Não informado'}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-sm">Data da Solicitação</h3>
                      <p className="text-sm flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        {new Date(selectedRide.created_at || '').toLocaleString('pt-BR')}
                      </p>
                    </div>

                    {selectedRide.motorista_nome && (
                      <div>
                        <h3 className="font-medium text-sm">Motorista</h3>
                        <p className="text-sm flex items-center gap-2">
                          <Truck className="h-4 w-4 text-gray-500" />
                          {selectedRide.motorista_nome}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-sm">Status</h3>
                      <p className={`text-sm font-medium px-2 py-1 rounded-full inline-flex ${
                        selectedRide.status === 'finalizada' ? 'bg-green-100 text-green-800' : 
                        selectedRide.status === 'em andamento' ? 'bg-blue-100 text-blue-800' : 
                        selectedRide.status === 'cancelada' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedRide.status}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-sm">Valor</h3>
                      <p className="text-sm font-bold">
                        {selectedRide.valor 
                          ? `R$ ${typeof selectedRide.valor === 'number' 
                              ? selectedRide.valor.toFixed(2) 
                              : parseFloat(selectedRide.valor).toFixed(2)}`
                          : 'Não informado'}
                      </p>
                    </div>

                    {selectedRide.data_inicio && (
                      <div>
                        <h3 className="font-medium text-sm">Início da Corrida</h3>
                        <p className="text-sm flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          {new Date(selectedRide.data_inicio).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    )}
                    
                    {selectedRide.data_fim && (
                      <div>
                        <h3 className="font-medium text-sm">Fim da Corrida</h3>
                        <p className="text-sm flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          {new Date(selectedRide.data_fim).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="border-t pt-4 space-y-2">
                  <div>
                    <h3 className="font-medium text-sm">Endereço de Origem</h3>
                    <p className="text-sm flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                      {selectedRide.solicitacao?.endereco_origem || 'Não informado'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm">Endereço de Destino</h3>
                    <p className="text-sm flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                      {selectedRide.solicitacao?.endereco_destino || 'Não informado'}
                    </p>
                  </div>
                  
                  {selectedRide.solicitacao?.descricao && (
                    <div>
                      <h3 className="font-medium text-sm">Descrição da Carga</h3>
                      <p className="text-sm bg-gray-50 p-3 rounded-md">
                        {selectedRide.solicitacao.descricao}
                      </p>
                    </div>
                  )}
                  
                  {selectedRide.observacoes && (
                    <div>
                      <h3 className="font-medium text-sm">Observações</h3>
                      <p className="text-sm bg-gray-50 p-3 rounded-md">
                        {selectedRide.observacoes}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          
          <DialogClose asChild>
            <Button className="mt-2" variant="outline">
              Fechar
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Detalhes do Motorista */}
      <Dialog open={driverModalOpen} onOpenChange={setDriverModalOpen}>
        <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto bg-white border shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" /> Detalhes do Motorista
            </DialogTitle>
            <DialogDescription>
              Informações completas sobre o motorista selecionado
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4">
            {selectedDriver && (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Truck className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedDriver.nome}</h2>
                    <p className={`text-sm font-medium px-2 py-1 rounded-full inline-flex ${
                      selectedDriver.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedDriver.status}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-sm">Documento</h3>
                      <p className="text-sm">
                        {selectedDriver.documentos ? 'Documento cadastrado' : 'Não informado'}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-sm">Telefone</h3>
                      <p className="text-sm flex items-center gap-2">
                        <PhoneCall className="h-4 w-4 text-gray-500" />
                        {selectedDriver.telefone || 'Não informado'}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-sm">Email</h3>
                      <p className="text-sm flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        {selectedDriver.email || 'Não informado'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-sm">Data de Cadastro</h3>
                      <p className="text-sm flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        {new Date(selectedDriver.data_cadastro || selectedDriver.created_at || '').toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-sm">Veículo</h3>
                      <p className="text-sm flex items-center gap-2">
                        <Car className="h-4 w-4 text-gray-500" />
                        {typeof selectedDriver.veiculo === 'object' 
                          ? selectedDriver.veiculo?.descricao || 'Não informado' 
                          : (typeof selectedDriver.veiculo === 'string' ? selectedDriver.veiculo : 'Não informado')}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-sm">Placa</h3>
                      <p className="text-sm">
                        {typeof selectedDriver.veiculo === 'object' 
                          ? selectedDriver.placa_veiculo || 'Não informado' 
                          : 'Não informado'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div>
                    <h3 className="font-medium text-sm">Observações</h3>
                    <p className="text-sm bg-gray-50 p-3 rounded-md mt-2">
                      {'Nenhuma observação registrada'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <DialogClose asChild>
            <Button className="mt-2" variant="outline">
              Fechar
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}
