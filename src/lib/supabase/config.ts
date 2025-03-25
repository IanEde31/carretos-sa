import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

// Obtendo os valores das variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Verificando se as variáveis de ambiente estão definidas
if (!supabaseUrl) {
  console.error('NEXT_PUBLIC_SUPABASE_URL não está definido!');
}

if (!supabaseAnonKey) {
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY não está definido!');
}

console.log('Supabase URL configurada:', !!supabaseUrl);
console.log('Supabase Key configurada:', !!supabaseAnonKey);

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
    const { data, error } = await supabase.auth.getSession();
    console.log("Status da autenticação:", data?.session ? "Autenticado" : "Não autenticado");
    return { data, error };
  } catch (e) {
    console.error("Erro ao verificar autenticação:", e);
    return { data: null, error: e };
  }
};
