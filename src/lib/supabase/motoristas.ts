import { supabase } from './config';
import { inviteUserByEmail } from './auth';

export interface Documentos {
  cnh?: string; // URL do documento CNH
  identidade?: string; // URL do documento de identidade (compatibilidade com o banco)
  documento_veiculo?: string; // URL do documento do veículo
  // Campos adicionais para separar frente e verso, serão mesclados em 'identidade'
  identidade_frente?: string;
  identidade_verso?: string;
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
  
  // Documentação pessoal
  cpf?: string; // CPF do motorista
  rg?: string; // RG do motorista
  
  // Endereço
  cep?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  
  // URLs de documentos
  cnh_url?: string;
  documento_veiculo_url?: string;
  
  // Autenticação
  auth_id?: string; // ID do usuário no sistema de autenticação do Supabase
}

export interface MotoristaFormData {
  // Informações Pessoais
  nome: string;
  email: string;
  telefone: string;
  status: string;
  
  // Documentação Pessoal
  cpf?: string; // CPF do motorista
  rg?: string; // RG do motorista
  
  // Veículo
  veiculo_tipo: string;
  veiculo_descricao: string;
  placa_veiculo?: string; // Placa do veículo
  capacidade_carga?: number; // Capacidade de carga
  
  // Área de atuação
  area_atuacao?: string; // Área de atuação
  
  // Endereço
  cep?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  
  // Arquivos
  doc_cnh?: File; // Arquivo da CNH
  doc_identidade_frente?: File; // Arquivo de identidade (frente)
  doc_identidade_verso?: File; // Arquivo de identidade (verso)
  doc_veiculo?: File; // Arquivo de documento do veículo
  foto_perfil?: File; // Foto de perfil
}

/**
 * Verifica a existência e cria o bucket se necessário
 * @returns Promise que indica o sucesso
 */
export async function garantirBucketDocumentos(): Promise<boolean> {
  try {
    // Verificar se o bucket existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Erro ao listar buckets:', listError);
      return false;
    }
    
    // Se o bucket não existir, criar
    if (!buckets.some(bucket => bucket.name === 'documentos')) {
      console.log('Bucket documentos não encontrado. Criando...');
      const { error: createError } = await supabase.storage.createBucket('documentos', {
        public: true,
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (createError) {
        console.error('Erro ao criar bucket documentos:', createError);
        return false;
      }
      
      console.log('Bucket documentos criado com sucesso!');
      
      // Criar política que permite uploads para todos os usuários autenticados
      try {
        // Verificar se está autenticado antes de criar política
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData?.session) {
          console.log('Criando política para permitir uploads para todos os usuários...');
          // Esta operação só funciona no painel do Supabase ou via API de administração
          // Instrui o usuário a fazer manualmente se necessário
        }
      } catch (policyError) {
        console.warn('Aviso: Não foi possível configurar políticas automaticamente. Você pode precisar fazer isso manualmente no painel do Supabase.', policyError);
      }
    } else {
      console.log('Bucket documentos já existe.');
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao verificar/criar bucket:', error);
    return false;
  }
}

/**
 * Faz upload de documento para o Supabase Storage - método simplificado
 * @param file Arquivo para upload
 * @param motoristaId ID do motorista
 * @param docType Tipo de documento (cnh, identidade_frente, identidade_verso, etc.)
 * @returns URL do documento
 */
export async function uploadDocumento(
  file: File,
  motoristaId: string,
  docType: string
): Promise<string> {
  if (!file) {
    console.log('Nenhum arquivo fornecido para upload');
    return '';
  }
  
  console.log(`Iniciando upload simplificado para ${docType}:`, { 
    nome: file.name, 
    tipo: file.type, 
    tamanho: `${(file.size / 1024).toFixed(2)} KB` 
  });
  
  try {
    // Método simples e direto - usar apenas o upload básico
    // sem tratamentos complexos ou conversões
    
    // Criar um caminho único com timestamp e organizado por pasta de motorista
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'bin';
    const fileName = `${motoristaId}/${docType}_${timestamp}.${extension}`;
    
    console.log(`Enviando arquivo para: documentos/${fileName}`);
    
    // Criar pasta do motorista (arquivo vazio como marcador)
    try {
      await supabase.storage
        .from('documentos')
        .upload(`${motoristaId}/.folder`, new Blob([''], { type: 'text/plain' }), {
          upsert: true
        });
    } catch (folderError) {
      // Ignorar erro de pasta já existente
      console.log('Pasta já existente ou erro não crítico:', folderError);
    }
    
    // Upload do arquivo na pasta do motorista
    const { data, error } = await supabase.storage
      .from('documentos')
      .upload(fileName, file, { upsert: true });
      
    if (error) {
      console.error(`Erro no upload:`, error.message);
      return '';
    }
    
    console.log('Upload concluído com sucesso!');
    
    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from('documentos')
      .getPublicUrl(fileName);
      
    console.log(`URL gerada: ${urlData?.publicUrl || 'Não disponível'}`);
    return urlData?.publicUrl || '';
  } catch (error) {
    console.error(`Erro no upload:`, error);
    return '';
  }
}

/**
 * Cria a pasta do motorista no bucket como workaround para problemas do Supabase
 */
async function criarPastaMotorista(motoristaId: string): Promise<void> {
  try {
    console.log(`Criando pasta para motorista: ${motoristaId}`);
    
    // Criar um arquivo vazio para simular a criação da pasta
    const { error } = await supabase.storage
      .from('documentos')
      .upload(`${motoristaId}/.folder`, new Blob([''], { type: 'text/plain' }), { 
        upsert: true 
      });
    
    if (error) {
      console.warn(`Aviso ao criar pasta: ${error.message}`);
    } else {
      console.log('Pasta criada com sucesso');
    }
  } catch (error) {
    console.warn('Erro ao criar pasta (não crítico):', error);
    // Continuamos mesmo se falhar aqui
  }
}

/**
 * Método alternativo de upload para ser usado como fallback
 */
async function uploadAlternativo(file: File, motoristaId: string, docType: string): Promise<string> {
  console.log('Tentando método alternativo de upload...');
  
  try {
    // Converter para base64 e depois para Blob
    const base64 = await fileToBase64(file);
    const blob = base64ToBlob(base64, file.type);
    
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'bin';
    const fileName = `${motoristaId}/${docType}_alt_${timestamp}.${extension}`;
    
    console.log('Enviando via método alternativo:', fileName);
    
    const { data, error } = await supabase.storage
      .from('documentos')
      .upload(fileName, blob, { 
        upsert: true, 
        contentType: file.type 
      });
    
    if (error) {
      console.error('Falha também no método alternativo:', error);
      return ''; // Desistimos neste ponto
    }
    
    const { data: urlData } = supabase.storage
      .from('documentos')
      .getPublicUrl(fileName);
    
    console.log('Upload alternativo bem-sucedido:', urlData?.publicUrl);
    return urlData?.publicUrl || '';
  } catch (error) {
    console.error('Erro final no upload:', error);
    return '';
  }
}

/**
 * Converte File para Base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Converte Base64 para Blob
 */
function base64ToBlob(base64: string, contentType: string): Blob {
  const byteString = atob(base64.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  return new Blob([ab], { type: contentType });
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
 * Cria um novo motorista e um usuário de autenticação associado
 * @param motorista Dados do motorista a ser criado
 * @param criarUsuario Se true, cria um usuário de autenticação e envia convite por email
 */
export async function createMotorista(
  motorista: MotoristaFormData, 
  criarUsuario: boolean = true
): Promise<Motorista> {
  try {
    // Formatando os dados conforme a estrutura da tabela
    const motoristaData: Partial<Motorista> = {
      // Informações pessoais e status
      nome: motorista.nome,
      email: motorista.email,
      telefone: motorista.telefone,
      status: motorista.status || 'ativo',
      
      // Documentação pessoal
      cpf: motorista.cpf,
      rg: motorista.rg,
      
      // Veículo
      veiculo: {
        tipo: motorista.veiculo_tipo,
        descricao: motorista.veiculo_descricao
      },
      placa_veiculo: motorista.placa_veiculo,
      capacidade_carga: motorista.capacidade_carga,
      
      // Área de atuação
      area_atuacao: motorista.area_atuacao,
      
      // Endereço
      cep: motorista.cep,
      rua: motorista.rua,
      numero: motorista.numero,
      bairro: motorista.bairro,
      cidade: motorista.cidade,
      uf: motorista.uf
    };
    
    // Primeiro criar o usuário de autenticação e enviar convite por email, se solicitado
    let userId = null;
    if (criarUsuario && motorista.email) {
      try {
        console.log('Criando usuário de autenticação para o motorista...');
        
        const { success, userId: authUserId, error } = await inviteUserByEmail(
          motorista.email,
          {
            nome: motorista.nome,
            tipo: 'motorista',
            telefone: motorista.telefone
            // O motoristaId será adicionado posteriormente
          },
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/motoristas/completar-cadastro`
        );
        
        if (success && authUserId) {
          console.log(`Usuário de autenticação criado com ID: ${authUserId}`);
          userId = authUserId;
          // Adicionar o auth_id aos dados do motorista para inserção
          motoristaData.auth_id = userId;
        } else if (error) {
          console.error('Erro ao criar usuário de autenticação:', error);
          // Continuar com a criação do motorista mesmo sem o auth_id
        }
      } catch (authError) {
        console.error('Erro ao criar usuário de autenticação:', authError);
        // Continuar com a criação do motorista mesmo sem o auth_id
      }
    }
    
    // Agora criar o motorista já com o auth_id (se disponível)
    console.log('Enviando dados para criar motorista:', motoristaData);
    
    const { data, error } = await supabase
      .from('motoristas')
      .insert([motoristaData])
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao criar motorista:', error);
      throw error;
    }
    
    // Após criar o motorista com sucesso, atualizar os metadados do usuário Auth com o ID do motorista
    if (userId) {
      try {
        // Tentar atualizar os metadados do usuário para incluir o ID do motorista
        // Usando auth.updateUser que é API pública (não admin)
        const { data: userData, error: userError } = await supabase.auth.updateUser({
          data: {
            motoristaId: data.id
          }
        });
        
        if (userError) {
          console.error('Erro ao atualizar metadados do usuário auth:', userError);
        } else {
          console.log('Metadados do usuário auth atualizados com o ID do motorista');
        }
      } catch (metadataError) {
        console.error('Erro ao atualizar metadados do usuário auth:', metadataError);
        // Não impedir o fluxo por causa deste erro
      }
    }
    
    // Após criar o motorista, fazer upload dos documentos
    const docUrls: Documentos = {};
    let cnhUrl = null;
    let identidadeFrenteUrl = null;
    let identidadeVersoUrl = null;
    let documentoVeiculoUrl = null;

    console.log('Iniciando uploads de documentos...');

    // Upload da CNH
    if (motorista.doc_cnh) {
      try {
        console.log('Enviando CNH...');
        cnhUrl = await uploadDocumento(motorista.doc_cnh, data.id, 'cnh');
        if (cnhUrl) {
          docUrls.cnh = cnhUrl;
          console.log('CNH salva com sucesso!');
        }
      } catch (error) {
        console.error('Erro ao enviar CNH:', error);
      }
    }
  
    // Upload da identidade (frente)
    if (motorista.doc_identidade_frente) {
      try {
        console.log('Enviando frente da identidade...');
        identidadeFrenteUrl = await uploadDocumento(motorista.doc_identidade_frente, data.id, 'identidade_frente');
        if (identidadeFrenteUrl) {
          docUrls.identidade_frente = identidadeFrenteUrl;
          // Manter compatibilidade com a estrutura do banco
          docUrls.identidade = identidadeFrenteUrl;
          console.log('Frente da identidade salva com sucesso!');
        }
      } catch (error) {
        console.error('Erro ao enviar frente da identidade:', error);
      }
    }
  
    // Upload da identidade (verso)
    if (motorista.doc_identidade_verso) {
      try {
        console.log('Enviando verso da identidade...');
        identidadeVersoUrl = await uploadDocumento(motorista.doc_identidade_verso, data.id, 'identidade_verso');
        if (identidadeVersoUrl) {
          docUrls.identidade_verso = identidadeVersoUrl;
          // Se já temos a frente, combinar as URLs
          if (docUrls.identidade_frente) {
            docUrls.identidade = `Frente: ${docUrls.identidade_frente} | Verso: ${identidadeVersoUrl}`;
          } else {
            // Caso contrário, usar apenas o verso
            docUrls.identidade = identidadeVersoUrl;
          }
          console.log('Verso da identidade salvo com sucesso!');
        }
      } catch (error) {
        console.error('Erro ao enviar verso da identidade:', error);
      }
    }
  
    // Upload do documento do veículo
    if (motorista.doc_veiculo) {
      try {
        console.log('Enviando documento do veículo...');
        documentoVeiculoUrl = await uploadDocumento(motorista.doc_veiculo, data.id, 'documento_veiculo');
        if (documentoVeiculoUrl) {
          docUrls.documento_veiculo = documentoVeiculoUrl;
          console.log('Documento do veículo salvo com sucesso!');
        }
      } catch (error) {
        console.error('Erro ao enviar documento do veículo:', error);
      }
    }
    
    // Upload da foto de perfil
    let fotoPerfilUrl = '';
    if (motorista.foto_perfil) {
      fotoPerfilUrl = await uploadDocumento(motorista.foto_perfil, data.id, 'perfil');
    }
    
    // Atualizar o motorista com as URLs dos documentos
    const updateData: any = { documentos: docUrls };
    
    // Atualizar também os campos específicos de URL
    if (cnhUrl) updateData.cnh_url = cnhUrl;
    if (documentoVeiculoUrl) updateData.documento_veiculo_url = documentoVeiculoUrl;
    if (fotoPerfilUrl) updateData.foto_perfil = fotoPerfilUrl;
    
    console.log('Atualizando documentos e foto:', updateData);
    
    const { error: docError } = await supabase
      .from('motoristas')
      .update(updateData)
      .eq('id', data.id);
    
    if (docError) {
      console.error('Erro ao atualizar documentos:', docError);
      throw docError;
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
      // Informações pessoais e status
      nome: motorista.nome,
      email: motorista.email,
      telefone: motorista.telefone,
      status: motorista.status,
      
      // Documentação pessoal
      cpf: motorista.cpf,
      rg: motorista.rg,
      
      // Veículo
      veiculo: {
        tipo: motorista.veiculo_tipo,
        descricao: motorista.veiculo_descricao
      },
      placa_veiculo: motorista.placa_veiculo,
      capacidade_carga: motorista.capacidade_carga,
      
      // Área de atuação
      area_atuacao: motorista.area_atuacao,
      
      // Endereço
      cep: motorista.cep,
      rua: motorista.rua,
      numero: motorista.numero,
      bairro: motorista.bairro,
      cidade: motorista.cidade,
      uf: motorista.uf
    };
    
    // Processar os uploads de documentos
    const docUrls: Documentos = currentMotorista?.documentos || {};
    let cnhUrl = null;
    let identidadeFrenteUrl = null;
    let identidadeVersoUrl = null;
    let documentoVeiculoUrl = null;

    console.log('Iniciando uploads de documentos para atualização...');

    // Upload da CNH
    if (motorista.doc_cnh) {
      try {
        console.log('Enviando CNH...');
        cnhUrl = await uploadDocumento(motorista.doc_cnh, id, 'cnh');
        if (cnhUrl) {
          docUrls.cnh = cnhUrl;
          console.log('CNH salva com sucesso!');
        }
      } catch (error) {
        console.error('Erro ao enviar CNH:', error);
      }
    }
    
    // Upload da identidade (frente)
    if (motorista.doc_identidade_frente) {
      try {
        console.log('Enviando frente da identidade...');
        identidadeFrenteUrl = await uploadDocumento(motorista.doc_identidade_frente, id, 'identidade_frente');
        if (identidadeFrenteUrl) {
          docUrls.identidade_frente = identidadeFrenteUrl;
          // Manter compatibilidade com a estrutura do banco
          docUrls.identidade = identidadeFrenteUrl;
          console.log('Frente da identidade salva com sucesso!');
        }
      } catch (error) {
        console.error('Erro ao enviar frente da identidade:', error);
      }
    }
    
    // Upload da identidade (verso)
    if (motorista.doc_identidade_verso) {
      try {
        console.log('Enviando verso da identidade...');
        identidadeVersoUrl = await uploadDocumento(motorista.doc_identidade_verso, id, 'identidade_verso');
        if (identidadeVersoUrl) {
          docUrls.identidade_verso = identidadeVersoUrl;
          // Se já temos a frente, combinar as URLs
          if (docUrls.identidade_frente) {
            docUrls.identidade = `Frente: ${docUrls.identidade_frente} | Verso: ${identidadeVersoUrl}`;
          } else {
            // Caso contrário, usar apenas o verso
            docUrls.identidade = identidadeVersoUrl;
          }
          console.log('Verso da identidade salvo com sucesso!');
        }
      } catch (error) {
        console.error('Erro ao enviar verso da identidade:', error);
      }
    }
    
    // Upload do documento do veículo
    if (motorista.doc_veiculo) {
      try {
        console.log('Enviando documento do veículo...');
        documentoVeiculoUrl = await uploadDocumento(motorista.doc_veiculo, id, 'documento_veiculo');
        if (documentoVeiculoUrl) {
          docUrls.documento_veiculo = documentoVeiculoUrl;
          console.log('Documento do veículo salvo com sucesso!');
        }
      } catch (error) {
        console.error('Erro ao enviar documento do veículo:', error);
      }
    }
    
    // Upload da foto de perfil
    if (motorista.foto_perfil) {
      try {
        console.log('Enviando foto de perfil...');
        motoristaData.foto_perfil = await uploadDocumento(motorista.foto_perfil, id, 'perfil');
        console.log('Foto de perfil salva com sucesso!');
      } catch (error) {
        console.error('Erro ao enviar foto de perfil:', error);
      }
    }
    
    // Incluir os documentos atualizados
    motoristaData.documentos = docUrls;
    
    // Se houver uploads de documentos, atualizar os campos de documentos
    if (Object.keys(docUrls).length > 0) {
      const updateData: any = { documentos: docUrls };
      
      // Atualizar também os campos específicos de URL
      if (cnhUrl) updateData.cnh_url = cnhUrl;
      if (documentoVeiculoUrl) updateData.documento_veiculo_url = documentoVeiculoUrl;
      
      console.log('Atualizando documentos:', updateData);
      
      const { error: docError } = await supabase
        .from('motoristas')
        .update(updateData)
        .eq('id', id);
      
      if (docError) {
        console.error('Erro ao atualizar documentos:', docError);
        throw docError;
      }
    }
    
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
      // Remover pasta completa do motorista
      const { data } = await supabase.storage
        .from('documentos')
        .list(`${id}`);
        
      if (data && data.length > 0) {
        // Criar lista de caminhos completos para deletar
        const filesToRemove = data.map(file => `${id}/${file.name}`);
        
        console.log(`Removendo ${filesToRemove.length} arquivos do motorista ${id}`);
        
        await supabase.storage
          .from('documentos')
          .remove(filesToRemove);
      }
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
