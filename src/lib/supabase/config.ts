import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

// Obtendo os valores das variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Verificando se as variáveis de ambiente estão definidas
if (!supabaseUrl) {
  console.error('NEXT_PUBLIC_SUPABASE_URL não está definido!');
} else {
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
}

if (!supabaseAnonKey) {
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY não está definido!');
} else {
  // Mostrar apenas os primeiros 10 caracteres por segurança
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey.substring(0, 10) + '...');
}

console.log('Ambiente de execução:', process.env.NODE_ENV);
console.log('Executando no cliente:', typeof window !== 'undefined');

// Verificar se estamos no cliente ou no servidor
const isClient = typeof window !== 'undefined';

// Cliente para uso no lado do cliente (browser)
export const createClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// Cliente tradicional para compatibilidade com código existente
// Usando diferentes configurações dependendo do ambiente
export const supabase = isClient
  ? createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'supabase.auth.token',
      },
    })
  : createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

// Função de utilidade para verificar o status da autenticação
export const checkAuth = async () => {
  try {
    console.log('Iniciando verificação de autenticação...');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Erro específico na autenticação:', error.message);
      console.error('Código do erro:', error.code);
      console.error('Detalhes completos:', error);
    }
    
    console.log("Status da autenticação:", data?.session ? "Autenticado" : "Não autenticado");
    console.log("Dados da sessão:", data?.session ? 'Disponível' : 'Nenhuma sessão ativa');
    
    return { data, error };
  } catch (e) {
    console.error("Erro ao verificar autenticação:", e);
    if (e instanceof Error) {
      console.error("Mensagem do erro:", e.message);
      console.error("Stack trace:", e.stack);
    }
    return { data: null, error: e };
  }
};

// Função para testar a conexão com o Supabase
export const testConnection = async () => {
  try {
    console.log('Testando conexão com o Supabase...');
    const { count, error } = await supabase
      .from('motoristas')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Erro ao testar conexão:', error.message);
      console.error('Código do erro:', error.code);
      return { success: false, error };
    }
    
    console.log('Conexão bem-sucedida! Contagem motoristas:', count);
    return { success: true, count };
  } catch (e) {
    console.error('Exceção ao testar conexão:', e);
    return { success: false, error: e };
  }
};
