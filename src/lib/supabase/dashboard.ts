import { supabase } from './config';

export interface DashboardMetrics {
  total_motoristas: number;
  motoristas_ativos: number;
  total_corridas: number;
  corridas_concluidas: number;
  corridas_em_andamento: number;
  corridas_canceladas: number;
  faturamento_total: number;
  faturamento_mes_atual: number;
  avaliacao_media: number;
}

/**
 * Busca todas as métricas do dashboard
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    console.log('Buscando métricas do dashboard...');
    
    // Contador de motoristas
    const motoristasResult = await supabase
      .from('motoristas')
      .select('*', { count: 'exact', head: true });
    
    console.log('Resultado da consulta de motoristas:', motoristasResult);
    const totalMotoristas = motoristasResult.count || 0;

    // Contador de motoristas ativos
    const motoristasAtivosResult = await supabase
      .from('motoristas')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ativo');
    
    console.log('Resultado da consulta de motoristas ativos:', motoristasAtivosResult);
    const motoristasAtivos = motoristasAtivosResult.count || 0;

    // Contadores de corridas
    const corridasResult = await supabase
      .from('corridas')
      .select('*', { count: 'exact', head: true });
    
    console.log('Resultado da consulta de corridas:', corridasResult);
    const totalCorridas = corridasResult.count || 0;

    const corridasConcluidasResult = await supabase
      .from('corridas')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'concluída');
    
    console.log('Resultado da consulta de corridas concluídas:', corridasConcluidasResult);
    const corridasConcluidas = corridasConcluidasResult.count || 0;

    const corridasEmAndamentoResult = await supabase
      .from('corridas')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'em andamento');
    
    console.log('Resultado da consulta de corridas em andamento:', corridasEmAndamentoResult);
    const corridasEmAndamento = corridasEmAndamentoResult.count || 0;

    const corridasCanceladasResult = await supabase
      .from('corridas')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'cancelada');
    
    console.log('Resultado da consulta de corridas canceladas:', corridasCanceladasResult);
    const corridasCanceladas = corridasCanceladasResult.count || 0;

    // Calcular faturamento total
    const faturamentoResult = await supabase
      .from('corridas')
      .select('valor')
      .eq('status', 'concluída');
    
    console.log('Resultado da consulta de faturamento:', faturamentoResult);
    const faturamentoData = faturamentoResult.data;
    const faturamentoTotal = faturamentoData
      ? faturamentoData.reduce((acc, curr) => acc + (curr.valor || 0), 0)
      : 0;

    // Calcular faturamento do mês atual
    const dataAtual = new Date();
    const primeiroDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1).toISOString();
    const ultimoDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0).toISOString();

    const faturamentoMesResult = await supabase
      .from('corridas')
      .select('valor')
      .eq('status', 'concluída')
      .gte('data_fim', primeiroDiaMes)
      .lte('data_fim', ultimoDiaMes);
    
    console.log('Resultado da consulta de faturamento do mês:', faturamentoMesResult);
    const faturamentoMesData = faturamentoMesResult.data;
    const faturamentoMesAtual = faturamentoMesData
      ? faturamentoMesData.reduce((acc, curr) => acc + (curr.valor || 0), 0)
      : 0;

    // Calcular avaliação média
    const avaliacoesResult = await supabase
      .from('corridas')
      .select('avaliacao')
      .eq('status', 'concluída')
      .not('avaliacao', 'is', null);
    
    console.log('Resultado da consulta de avaliações:', avaliacoesResult);
    const avaliacoesData = avaliacoesResult.data;
    const totalAvaliacoes = avaliacoesData ? avaliacoesData.length : 0;
    const somaAvaliacoes = avaliacoesData
      ? avaliacoesData.reduce((acc, curr) => acc + (curr.avaliacao || 0), 0)
      : 0;
    const avaliacaoMedia = totalAvaliacoes > 0 ? somaAvaliacoes / totalAvaliacoes : 0;

    const metricas = {
      total_motoristas: totalMotoristas,
      motoristas_ativos: motoristasAtivos,
      total_corridas: totalCorridas,
      corridas_concluidas: corridasConcluidas,
      corridas_em_andamento: corridasEmAndamento,
      corridas_canceladas: corridasCanceladas,
      faturamento_total: faturamentoTotal,
      faturamento_mes_atual: faturamentoMesAtual,
      avaliacao_media: avaliacaoMedia
    };
    
    console.log('Métricas calculadas:', metricas);
    return metricas;
  } catch (error) {
    console.error('Erro ao buscar métricas do dashboard:', error);
    throw error;
  }
}

/**
 * Busca as últimas corridas (limitadas a um número)
 */
export async function getUltimasCorridas(limit: number = 5) {
  try {
    const { data, error } = await supabase
      .from('corridas')
      .select(`
        *,
        solicitacao:solicitacao_id(
          id,
          cliente_nome,
          endereco_origem,
          endereco_destino
        ),
        motorista:motorista_id(
          id,
          nome
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    console.log('Resultado da consulta de últimas corridas:', data);
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar últimas corridas:', error);
    throw error;
  }
}

/**
 * Busca os motoristas ativos (limitados a um número)
 */
export async function getMotoristasAtivos(limit: number = 5) {
  try {
    const { data, error } = await supabase
      .from('motoristas')
      .select('*')
      .eq('status', 'ativo')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    console.log('Resultado da consulta de motoristas ativos:', data);
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar motoristas ativos:', error);
    throw error;
  }
}
