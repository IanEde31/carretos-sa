'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardMetrics, getUltimasCorridas, getMotoristasAtivos } from '@/lib/supabase/dashboard';
import { Loader2 } from 'lucide-react';
import { type Corrida } from '@/lib/supabase/corridas';
import { type Motorista } from '@/lib/supabase/motoristas';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true);
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
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.total_corridas}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.total_corridas ? `+${((metrics.corridas_concluidas / metrics.total_corridas) * 100).toFixed(0)}% concluídas` : 'Sem corridas registradas'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Motoristas Ativos
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
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.motoristas_ativos}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.total_motoristas ? `${((metrics.motoristas_ativos / metrics.total_motoristas) * 100).toFixed(0)}% do total de motoristas` : 'Nenhum motorista registrado'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Faturamento
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
                <div className="text-2xl font-bold">R$ {metrics.faturamento_total.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.faturamento_total ? `${((metrics.faturamento_mes_atual / metrics.faturamento_total) * 100).toFixed(0)}% no mês atual` : 'Sem faturamento registrado'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Nota Média
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
                <div className="text-2xl font-bold">{metrics.avaliacao_media ? metrics.avaliacao_media.toFixed(1) : '0.0'}/5.0</div>
                <p className="text-xs text-muted-foreground">
                  Baseado em {metrics.corridas_concluidas} avaliações
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Últimas Corridas e Motoristas */}
          <div className="grid gap-4 md:grid-cols-2">
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
                            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                            <circle cx="7" cy="17" r="2" />
                            <path d="M9 17h6" />
                            <circle cx="17" cy="17" r="2" />
                          </svg>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {ride.solicitacao?.cliente_nome || `Corrida #${ride.id}`}
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
    </div>
  );
}
