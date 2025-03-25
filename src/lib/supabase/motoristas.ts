import { supabase } from './config';

export interface Documentos {
  cnh?: string; // URL do documento CNH
  identidade?: string; // URL do documento de identidade
  documento_veiculo?: string; // URL do documento do veículo
}

export interface Motorista {
  id?: string;
  nome: string;
  email: string;
  telefone: string;
  veiculo: {
    tipo: string;
    descricao: string;
  };
  status: string;
  documentos?: Documentos; // URLs dos documentos
  foto_perfil?: string; // URL da foto de perfil
  capacidade_carga?: number; // Capacidade de carga em kg ou m³
  area_atuacao?: string; // Área de atuação do motorista
  placa_veiculo?: string; // Placa do veículo
  data_cadastro?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MotoristaFormData {
  nome: string;
  email: string;
  telefone: string;
  veiculo_tipo: string;
  veiculo_descricao: string;
  status: string;
  doc_cnh?: File; // Arquivo da CNH
  doc_identidade?: File; // Arquivo de identidade
  doc_veiculo?: File; // Arquivo de documento do veículo
  foto_perfil?: File; // Foto de perfil
  capacidade_carga?: number; // Capacidade de carga
  area_atuacao?: string; // Área de atuação
  placa_veiculo?: string; // Placa do veículo
}

/**
 * Faz upload de documento para o Supabase Storage
 * @param file Arquivo para upload
 * @param motoristaId ID do motorista
 * @param docType Tipo de documento (cnh, identidade, etc.)
 * @returns URL do documento
 */
export async function uploadDocumento(
  file: File,
  motoristaId: string,
  docType: string
): Promise<string> {
  if (!file) return '';
  
  try {
    const extension = file.name.split('.').pop();
    const fileName = `${motoristaId}/${docType}.${extension}`;
    
    const { error } = await supabase.storage
      .from('motoristas')
      .upload(fileName, file, { upsert: true });
      
    if (error) {
      console.error(`Erro ao fazer upload de ${docType}:`, error);
      throw error;
    }
    
    // Retornar URL pública do arquivo
    const { data: urlData } = supabase.storage
      .from('motoristas')
      .getPublicUrl(fileName);
      
    return urlData.publicUrl;
  } catch (error) {
    console.error(`Erro ao fazer upload de ${docType}:`, error);
    throw error;
  }
}

/**
 * Busca todos os motoristas
 */
export async function getMotoristas() {
  try {
    const { data, error } = await supabase
      .from('motoristas')
      .select('*')
      .order('nome');
    
    if (error) {
      console.error('Erro ao buscar motoristas:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar motoristas:', error);
    throw error;
  }
}

/**
 * Busca um motorista pelo ID
 */
export async function getMotoristaById(id: string) {
  try {
    const { data, error } = await supabase
      .from('motoristas')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Erro ao buscar motorista com ID ${id}:`, error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`Erro ao buscar motorista com ID ${id}:`, error);
    throw error;
  }
}

/**
 * Cria um novo motorista
 */
export async function createMotorista(motorista: MotoristaFormData): Promise<Motorista> {
  try {
    // Formatando os dados conforme a estrutura da tabela
    const motoristaData: Partial<Motorista> = {
      nome: motorista.nome,
      email: motorista.email,
      telefone: motorista.telefone,
      veiculo: {
        tipo: motorista.veiculo_tipo,
        descricao: motorista.veiculo_descricao
      },
      status: motorista.status || 'ativo',
      capacidade_carga: motorista.capacidade_carga,
      area_atuacao: motorista.area_atuacao,
      placa_veiculo: motorista.placa_veiculo
    };
    
    console.log('Enviando dados para criar motorista:', motoristaData);
    
    // Criar o motorista primeiro para obter o ID
    const { data, error } = await supabase
      .from('motoristas')
      .insert([motoristaData])
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao criar motorista:', error);
      throw error;
    }
    
    // Após criar o motorista, fazer upload dos documentos
    const docUrls: Documentos = {};
    
    if (data.id) {
      try {
        // Upload da CNH
        if (motorista.doc_cnh) {
          docUrls.cnh = await uploadDocumento(motorista.doc_cnh, data.id, 'cnh');
        }
        
        // Upload da identidade
        if (motorista.doc_identidade) {
          docUrls.identidade = await uploadDocumento(motorista.doc_identidade, data.id, 'identidade');
        }
        
        // Upload do documento do veículo
        if (motorista.doc_veiculo) {
          docUrls.documento_veiculo = await uploadDocumento(motorista.doc_veiculo, data.id, 'documento_veiculo');
        }
        
        // Upload da foto de perfil
        let fotoPerfilUrl = '';
        if (motorista.foto_perfil) {
          fotoPerfilUrl = await uploadDocumento(motorista.foto_perfil, data.id, 'perfil');
        }
        
        // Atualizar o motorista com as URLs dos documentos
        const { data: updatedData, error: updateError } = await supabase
          .from('motoristas')
          .update({ 
            documentos: docUrls,
            foto_perfil: fotoPerfilUrl
          })
          .eq('id', data.id)
          .select()
          .single();
        
        if (updateError) {
          console.error('Erro ao atualizar motorista com documentos:', updateError);
        } else {
          return updatedData;
        }
      } catch (uploadError) {
        console.error('Erro ao fazer upload de documentos:', uploadError);
        // Continuar retornando os dados do motorista mesmo que o upload falhe
      }
    }
    
    console.log('Motorista criado com sucesso:', data);
    return data;
  } catch (error) {
    console.error('Erro ao criar motorista:', error);
    throw error;
  }
}

/**
 * Atualiza um motorista existente
 */
export async function updateMotorista(id: string, motorista: MotoristaFormData): Promise<Motorista> {
  try {
    // Buscar os dados atuais do motorista para manter os documentos existentes
    const { data: currentMotorista } = await supabase
      .from('motoristas')
      .select('*')
      .eq('id', id)
      .single();
    
    // Formatando os dados conforme a estrutura da tabela
    const motoristaData: Partial<Motorista> = {
      nome: motorista.nome,
      email: motorista.email,
      telefone: motorista.telefone,
      veiculo: {
        tipo: motorista.veiculo_tipo,
        descricao: motorista.veiculo_descricao
      },
      status: motorista.status,
      capacidade_carga: motorista.capacidade_carga,
      area_atuacao: motorista.area_atuacao,
      placa_veiculo: motorista.placa_veiculo
    };
    
    // Processar os uploads de documentos
    const docUrls: Documentos = currentMotorista?.documentos || {};
    
    // Upload da CNH
    if (motorista.doc_cnh) {
      docUrls.cnh = await uploadDocumento(motorista.doc_cnh, id, 'cnh');
    }
    
    // Upload da identidade
    if (motorista.doc_identidade) {
      docUrls.identidade = await uploadDocumento(motorista.doc_identidade, id, 'identidade');
    }
    
    // Upload do documento do veículo
    if (motorista.doc_veiculo) {
      docUrls.documento_veiculo = await uploadDocumento(motorista.doc_veiculo, id, 'documento_veiculo');
    }
    
    // Upload da foto de perfil
    if (motorista.foto_perfil) {
      motoristaData.foto_perfil = await uploadDocumento(motorista.foto_perfil, id, 'perfil');
    }
    
    // Incluir os documentos atualizados
    motoristaData.documentos = docUrls;
    
    const { data, error } = await supabase
      .from('motoristas')
      .update(motoristaData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Erro ao atualizar motorista com ID ${id}:`, error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`Erro ao atualizar motorista com ID ${id}:`, error);
    throw error;
  }
}

/**
 * Altera o status de um motorista
 */
export async function updateMotoristaStatus(id: string, status: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('motoristas')
      .update({ status })
      .eq('id', id);
    
    if (error) {
      console.error(`Erro ao atualizar status do motorista com ID ${id}:`, error);
      throw error;
    }
  } catch (error) {
    console.error(`Erro ao atualizar status do motorista com ID ${id}:`, error);
    throw error;
  }
}

/**
 * Deleta um motorista
 */
export async function deleteMotorista(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('motoristas')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Erro ao deletar motorista com ID ${id}:`, error);
      throw error;
    }
    
    // Remover arquivos do storage
    try {
      await supabase.storage
        .from('motoristas')
        .remove([`${id}`]);
    } catch (storageError) {
      console.error(`Erro ao remover arquivos do motorista ${id}:`, storageError);
      // Não propagar erro do storage
    }
  } catch (error) {
    console.error(`Erro ao deletar motorista com ID ${id}:`, error);
    throw error;
  }
}

/**
 * Retorna os tipos de veículos disponíveis
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
