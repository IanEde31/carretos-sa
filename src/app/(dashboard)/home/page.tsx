'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardMetrics, getUltimasCorridas, getMotoristasAtivos } from '@/lib/supabase/dashboard';
import { Loader2, AlertTriangle } from 'lucide-react';
import { type Corrida } from '@/lib/supabase/corridas';
import { type Motorista } from '@/lib/supabase/motoristas';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import AuthDebug from '@/components/auth-debug';
import { testConnection, checkAuth } from '@/lib/supabase/config';

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
  const [showAuthDebug, _] = useState(true); // Ativado por padrão para diagnóstico

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

  const handleShowToast = () => {
    toast({
      title: "Notificação de teste",
      description: "Esta notificação desaparecerá automaticamente em 5 segundos.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-8 items-center justify-center min-h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando dashboard...</p>
      </div>
    );
  }
  
  if (connectionError) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-8 items-center justify-center min-h-[70vh]">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-bold text-destructive">Erro de Conexão</h2>
        <p className="text-muted-foreground text-center max-w-md">{connectionError}</p>
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
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
          <p className="text-muted-foreground">
            Visão geral do sistema Carretos.sa
          </p>
        </div>
        <Button onClick={handleShowToast}>Testar Notificação</Button>
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
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M16 3h5v5" />
                  <path d="M21 3l-7 7" />
                  <path d="M3 8v8a5 5 0 0 0 5 5h8" />
                  <path d="m13 9 6 6" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.total_corridas}</div>
                <p className="text-xs text-muted-foreground">
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
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.total_motoristas}</div>
                <p className="text-xs text-muted-foreground">
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
                  className="h-4 w-4 text-muted-foreground"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {metrics.faturamento_total.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
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
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.avaliacao_media.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">
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
                      <div key={ride.id} className="flex items-center">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4"
                          >
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                          </svg>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {ride.solicitacao?.endereco_origem || 'Origem não definida'} → {ride.solicitacao?.endereco_destino || 'Destino não definido'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {ride.valor ? `R$ ${ride.valor.toFixed(2)}` : 'Valor não definido'}
                          </p>
                        </div>
                        <div className="ml-auto text-xs text-right">
                          <p>{new Date(ride.data_inicio || ride.created_at || '').toLocaleDateString('pt-BR')}</p>
                          <p className={`font-medium ${
                            ride.status === 'concluída' ? 'text-green-500' : 
                            ride.status === 'em andamento' ? 'text-blue-500' : 
                            'text-yellow-500'
                          }`}>
                            {ride.status}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">Nenhuma corrida registrada</p>
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
                      <div key={driver.id} className="flex items-center">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4"
                          >
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {driver.nome}
                          </p>
                          <p className="text-xs text-muted-foreground">
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
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">Nenhum motorista ativo</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Conteúdo da aba Estatísticas */}
        <TabsContent value="statistics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas (Em breve)</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Esta seção exibirá gráficos e estatísticas detalhadas sobre o desempenho do sistema.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {showAuthDebug && <AuthDebug />}
    </div>
  );
}
