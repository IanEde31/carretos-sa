import { supabase } from './config';
import { getMotoristaById } from './motoristas';

export interface Solicitacao {
  id?: string;
  // Dados do cliente
  cliente_nome: string;
  cliente_contato: string;
  cliente_email?: string;
  cliente_empresa?: string;
  
  // Dados do endereço de origem
  endereco_origem: string;
  cep_origem?: string;
  numero_origem?: string;
  complemento_origem?: string;
  bairro_origem?: string;
  cidade_origem?: string;
  estado_origem?: string;
  ponto_referencia_origem?: string;
  
  // Dados do endereço de destino
  endereco_destino: string;
  cep_destino?: string;
  numero_destino?: string;
  complemento_destino?: string;
  bairro_destino?: string;
  cidade_destino?: string;
  estado_destino?: string;
  ponto_referencia_destino?: string;
  
  // Dados da carga
  descricao?: string;
  dimensoes?: string;
  peso_aproximado?: string;
  quantidade_itens?: string;
  tipo_veiculo_requerido?: string; // Tipo de veículo necessário para a corrida
  fotos_carga?: string[]; // Array com URLs das fotos da carga
  
  // Dados adicionais
  data_solicitacao?: string;
  data_retirada?: string; // Armazenado como string ISO no banco de dados
  horario_retirada?: string;
  status: string;
  valor?: number;
  observacoes?: string;
  
  // Metadados
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
  // Campos adicionais para visualização - não existem na tabela, são adicionados em runtime
  solicitacao?: Solicitacao;
  motorista_nome?: string; // Campo virtual adicionado pela função getCorridas
}

export interface NovaCorridaForm {
  // Dados do cliente
  cliente_nome: string;
  cliente_contato: string;
  cliente_email?: string;
  cliente_empresa?: string;
  
  // Dados do endereço de origem
  cep_origem?: string;
  endereco_origem: string;
  numero_origem?: string;
  complemento_origem?: string;
  bairro_origem?: string;
  cidade_origem?: string;
  estado_origem?: string;
  ponto_referencia_origem?: string;
  
  // Dados do endereço de destino
  cep_destino?: string;
  endereco_destino: string;
  numero_destino?: string;
  complemento_destino?: string;
  bairro_destino?: string;
  cidade_destino?: string;
  estado_destino?: string;
  ponto_referencia_destino?: string;
  
  // Dados da carga
  descricao?: string;
  dimensoes?: string;
  peso_aproximado?: string;
  quantidade_itens?: string;
  tipo_veiculo_requerido?: string; // Tipo de veículo necessário para a corrida
  fotos_carga?: File[]; // Arquivos de fotos da carga
  
  // Dados adicionais
  valor?: string; // Valor da corrida (em reais)
  observacoes?: string;
  data_retirada?: Date;
  horario_retirada?: string;
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
          *
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
    // Assumimos que o bucket 'corridas' já existe e foi configurado com as políticas corretas
    // Não tentamos mais criar o bucket para evitar erros de permissão
    
    const uploadedFiles: string[] = [];
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const extension = file.name.split('.').pop();
      const fileName = `${prefix}_${Date.now()}_${index}.${extension}`;
      
      console.log(`Enviando arquivo ${index + 1}/${files.length}: ${file.name} (${file.size} bytes)`);
      
      // Upload do arquivo para o Storage
      const result = await supabase.storage
        .from('corridas')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      // Verificar se houve erro
      if (result.error) {
        console.error('Erro ao fazer upload de arquivo:', result.error);
        console.error('Detalhes do erro:', JSON.stringify(result.error, null, 2));
        
        if (result.error.message.includes('permission') || result.error.message.includes('policy')) {
          throw new Error(`Erro de permissão ao enviar o arquivo. Verifique as políticas de acesso do bucket 'corridas'. Detalhe: ${result.error.message}`);
        }
        
        continue;
      }
      
      console.log(`Upload com sucesso: ${fileName}`);
      
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
    
    // Formatar endereços completos para manter compatibilidade com versões anteriores
    // Endereço de origem
    const enderecoOrigemCompleto = `${dados.endereco_origem}${dados.numero_origem ? `, ${dados.numero_origem}` : ''}`
      + `${dados.bairro_origem ? `, ${dados.bairro_origem}` : ''}`
      + `${dados.cidade_origem ? `, ${dados.cidade_origem}` : ''}`
      + `${dados.estado_origem ? ` - ${dados.estado_origem}` : ''}`;

    // Endereço de destino  
    const enderecoDestinoCompleto = `${dados.endereco_destino}${dados.numero_destino ? `, ${dados.numero_destino}` : ''}`
      + `${dados.bairro_destino ? `, ${dados.bairro_destino}` : ''}`
      + `${dados.cidade_destino ? `, ${dados.cidade_destino}` : ''}`
      + `${dados.estado_destino ? ` - ${dados.estado_destino}` : ''}`;
    
    // 2. Criar a solicitação com todos os novos campos
    const { data: solicitacao, error: solicitacaoError } = await supabase
      .from('solicitacoes')
      .insert([{
        // Dados do cliente
        cliente_nome: dados.cliente_nome,
        cliente_contato: dados.cliente_contato,
        cliente_email: dados.cliente_email,
        cliente_empresa: dados.cliente_empresa,
        
        // Campos de endereço legado para compatibilidade
        endereco_origem: enderecoOrigemCompleto,
        endereco_destino: enderecoDestinoCompleto,
        
        // Dados detalhados de origem
        cep_origem: dados.cep_origem,
        numero_origem: dados.numero_origem,
        complemento_origem: dados.complemento_origem,
        bairro_origem: dados.bairro_origem,
        cidade_origem: dados.cidade_origem,
        estado_origem: dados.estado_origem,
        ponto_referencia_origem: dados.ponto_referencia_origem,
        
        // Dados detalhados de destino
        cep_destino: dados.cep_destino,
        numero_destino: dados.numero_destino,
        complemento_destino: dados.complemento_destino,
        bairro_destino: dados.bairro_destino,
        cidade_destino: dados.cidade_destino,
        estado_destino: dados.estado_destino,
        ponto_referencia_destino: dados.ponto_referencia_destino,
        
        // Dados da carga e informações adicionais
        descricao: dados.descricao,
        dimensoes: dados.dimensoes,
        peso_aproximado: dados.peso_aproximado,
        quantidade_itens: dados.quantidade_itens,
        fotos_carga: fotosUrls,
        tipo_veiculo_requerido: dados.tipo_veiculo_requerido || 'carro',
        valor: dados.valor ? parseFloat(dados.valor) : null,
        observacoes: dados.observacoes,
        data_retirada: dados.data_retirada,
        horario_retirada: dados.horario_retirada,
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
