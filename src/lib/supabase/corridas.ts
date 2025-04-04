import { supabase } from './config';
import { getMotoristaById } from './motoristas';

export interface Solicitacao {
  id?: string;
  cliente_nome: string;
  cliente_contato: string;
  endereco_origem: string;
  endereco_destino: string;
  descricao?: string;
  data_solicitacao?: string;
  status: string;
  fotos_carga?: string[]; // Array com URLs das fotos da carga
  tipo_veiculo_requerido?: string; // Tipo de veículo necessário para a corrida
  created_at?: string;
  updated_at?: string;
}

export interface Corrida {
  id?: string;
  solicitacao_id: string;
  motorista_id?: string;
  data_inicio?: string;
  data_fim?: string;
  status: string;
  valor?: number;
  observacoes?: string;
  fotos_entrega?: string[]; // Fotos da entrega concluída
  avaliacao?: number; // Avaliação da corrida (1-5)
  feedback?: string; // Comentários do cliente
  distancia_km?: number; // Distância percorrida em km
  created_at?: string;
  updated_at?: string;
  // Campos adicionais para visualização
  solicitacao?: Solicitacao;
  motorista_nome?: string;
}

export interface NovaCorridaForm {
  cliente_nome: string;
  cliente_contato: string;
  endereco_origem: string;
  endereco_destino: string;
  descricao?: string;
  fotos_carga?: File[]; // Arquivos de fotos da carga
  tipo_veiculo_requerido?: string; // Tipo de veículo necessário para a corrida
  valor?: string; // Valor da corrida (em reais)
}

/**
 * Busca todas as corridas com detalhes
 */
export async function getCorridas() {
  try {
    const { data: corridas, error } = await supabase
      .from('corridas')
      .select(`
        *,
        solicitacao:solicitacao_id (
          id,
          cliente_nome,
          cliente_contato,
          endereco_origem,
          endereco_destino,
          descricao,
          fotos_carga,
          tipo_veiculo_requerido,
          status
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar corridas:', error);
      throw error;
    }
    
    // Buscar dados dos motoristas para cada corrida
    const corridasCompletas = await Promise.all(
      corridas.map(async (corrida) => {
        if (corrida.motorista_id) {
          try {
            const motorista = await getMotoristaById(corrida.motorista_id);
            return {
              ...corrida,
              motorista_nome: motorista?.nome || 'Motorista não encontrado'
            };
          } catch (error) {
            console.error(`Erro ao buscar motorista da corrida ${corrida.id}:`, error);
            return {
              ...corrida,
              motorista_nome: 'Erro ao buscar motorista'
            };
          }
        }
        return corrida;
      })
    );
    
    return corridasCompletas || [];
  } catch (error) {
    console.error('Erro ao buscar corridas:', error);
    throw error;
  }
}

/**
 * Faz upload de imagens para o Supabase Storage
 * @param files Array de arquivos para upload
 * @param prefix Prefixo para o nome dos arquivos
 * @returns Array com URLs das imagens
 */
export async function uploadImagens(files: File[], prefix: string): Promise<string[]> {
  if (!files || files.length === 0) return [];
  
  try {
    const uploadedFiles: string[] = [];
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const extension = file.name.split('.').pop();
      const fileName = `${prefix}_${Date.now()}_${index}.${extension}`;
      
      // Upload do arquivo para o Storage
      const result = await supabase.storage
        .from('corridas')
        .upload(fileName, file);
        
      // Verificar se houve erro
      if (result.error) {
        console.error('Erro ao fazer upload de arquivo:', result.error);
        continue;
      }
      
      // Retornar URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from('corridas')
        .getPublicUrl(fileName);
        
      uploadedFiles.push(urlData.publicUrl);
    }
    
    return uploadedFiles;
  } catch (error) {
    console.error('Erro ao fazer upload de imagens:', error);
    throw error;
  }
}

/**
 * Cria uma nova solicitação e a correspondente corrida
 */
export async function criarSolicitacaoECorrida(dados: NovaCorridaForm): Promise<Corrida> {
  try {
    // 1. Fazer upload das imagens, se houver
    let fotosUrls: string[] = [];
    if (dados.fotos_carga && dados.fotos_carga.length > 0) {
      fotosUrls = await uploadImagens(dados.fotos_carga, 'carga');
    }
    
    // 2. Criar a solicitação
    const { data: solicitacao, error: solicitacaoError } = await supabase
      .from('solicitacoes')
      .insert([{
        cliente_nome: dados.cliente_nome,
        cliente_contato: dados.cliente_contato,
        endereco_origem: dados.endereco_origem,
        endereco_destino: dados.endereco_destino,
        descricao: dados.descricao,
        fotos_carga: fotosUrls,
        tipo_veiculo_requerido: dados.tipo_veiculo_requerido || 'carro',
        status: 'pendente'
      }])
      .select()
      .single();
    
    if (solicitacaoError) {
      throw solicitacaoError;
    }
    
    // 3. Criar a corrida vinculada à solicitação
    const { data: corrida, error: corridaError } = await supabase
      .from('corridas')
      .insert([{
        solicitacao_id: solicitacao.id,
        status: 'pendente',
        valor: dados.valor ? parseFloat(dados.valor) : null // Incluir o valor da corrida se fornecido
      }])
      .select()
      .single();
    
    if (corridaError) {
      throw corridaError;
    }
    
    // Retorna os dados da corrida com os dados da solicitação
    return {
      ...corrida,
      solicitacao
    };
  } catch (error) {
    console.error('Erro ao criar solicitação e corrida:', error);
    throw error;
  }
}

/**
 * Atualiza o status de uma corrida
 */
export async function atualizarStatusCorrida(id: string, status: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('corridas')
      .update({ status })
      .eq('id', id);
    
    if (error) {
      console.error(`Erro ao atualizar status da corrida ${id}:`, error);
      throw error;
    }
  } catch (error) {
    console.error(`Erro ao atualizar status da corrida ${id}:`, error);
    throw error;
  }
}

/**
 * Atribuir um motorista a uma corrida
 */
export async function atribuirMotorista(corridaId: string, motoristaId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('corridas')
      .update({ 
        motorista_id: motoristaId,
        status: 'atribuída',
        data_inicio: new Date().toISOString()
      })
      .eq('id', corridaId);
    
    if (error) {
      console.error(`Erro ao atribuir motorista à corrida ${corridaId}:`, error);
      throw error;
    }
    
    // Também atualiza o status da solicitação
    const { data: corrida } = await supabase
      .from('corridas')
      .select('solicitacao_id')
      .eq('id', corridaId)
      .single();
    
    if (corrida) {
      await supabase
        .from('solicitacoes')
        .update({ status: 'em andamento' })
        .eq('id', corrida.solicitacao_id);
    }
  } catch (error) {
    console.error(`Erro ao atribuir motorista à corrida ${corridaId}:`, error);
    throw error;
  }
}

/**
 * Finalizar uma corrida
 */
export async function finalizarCorrida(
  id: string, 
  valor?: number, 
  observacoes?: string,
  fotosEntrega?: File[],
  avaliacao?: number,
  feedback?: string,
  distancia_km?: number
): Promise<void> {
  try {
    // Fazer upload das fotos de entrega, se houver
    let fotosUrls: string[] = [];
    if (fotosEntrega && fotosEntrega.length > 0) {
      fotosUrls = await uploadImagens(fotosEntrega, 'entrega');
    }
    
    const { error } = await supabase
      .from('corridas')
      .update({ 
        status: 'finalizada',
        data_fim: new Date().toISOString(),
        valor: valor || 0,
        observacoes,
        fotos_entrega: fotosUrls,
        avaliacao,
        feedback,
        distancia_km
      })
      .eq('id', id);
    
    if (error) {
      console.error(`Erro ao finalizar corrida ${id}:`, error);
      throw error;
    }
    
    // Também atualiza o status da solicitação
    const { data: corrida } = await supabase
      .from('corridas')
      .select('solicitacao_id')
      .eq('id', id)
      .single();
    
    if (corrida) {
      await supabase
        .from('solicitacoes')
        .update({ status: 'finalizada' })
        .eq('id', corrida.solicitacao_id);
    }
  } catch (error) {
    console.error(`Erro ao finalizar corrida ${id}:`, error);
    throw error;
  }
}

/**
 * Cancela uma corrida
 */
export async function cancelarCorrida(id: string, motivo?: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('corridas')
      .update({ 
        status: 'cancelada',
        observacoes: motivo
      })
      .eq('id', id);
    
    if (error) {
      console.error(`Erro ao cancelar corrida ${id}:`, error);
      throw error;
    }
    
    // Também atualiza o status da solicitação
    const { data: corrida } = await supabase
      .from('corridas')
      .select('solicitacao_id')
      .eq('id', id)
      .single();
    
    if (corrida) {
      await supabase
        .from('solicitacoes')
        .update({ status: 'cancelada' })
        .eq('id', corrida.solicitacao_id);
    }
  } catch (error) {
    console.error(`Erro ao cancelar corrida ${id}:`, error);
    throw error;
  }
}

/**
 * Busca motoristas disponíveis para atribuição
 */
export async function getMotoristas() {
  try {
    const { data, error } = await supabase
      .from('motoristas')
      .select('id, nome')
      .eq('status', 'ativo')
      .order('nome');
    
    if (error) {
      console.error('Erro ao buscar motoristas ativos:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar motoristas ativos:', error);
    throw error;
  }
}

/**
 * Busca tipos de veículos disponíveis para seleção
 */
export function getTiposVeiculos() {
  return [
    { id: 'carro', nome: 'Carro de Passeio' },
    { id: 'utilitario', nome: 'Utilitário' },
    { id: 'van', nome: 'Van' },
    { id: 'caminhao_pequeno', nome: 'Caminhão Pequeno (3/4)' },
    { id: 'caminhao_medio', nome: 'Caminhão Médio (Toco)' },
    { id: 'caminhao_grande', nome: 'Caminhão Grande (Truck)' },
    { id: 'caminhao_carreta', nome: 'Carreta' },
    { id: 'moto', nome: 'Moto' }
  ];
}
