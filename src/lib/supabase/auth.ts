import { supabase } from './config';

export type LoginCredentials = {
  email: string;
  password: string;
};

export type SignUpCredentials = {
  email: string;
  password: string;
  nome: string;
  perfil?: string;
};

export async function signIn({ email, password }: LoginCredentials) {
  console.log(`Tentando autenticar usuário: ${email}`);
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Erro de autenticação:', error.message);
      throw new Error(error.message);
    }

    if (!data.session) {
      console.error('Autenticação bem-sucedida, mas sem sessão retornada');
      throw new Error('Erro ao obter sessão. Tente novamente.');
    }

    console.log('Login bem-sucedido:', data.user?.email);
    console.log('Token de acesso obtido:', data.session.access_token.substring(0, 10) + '...');
    
    return data;
  } catch (err) {
    console.error('Erro durante autenticação:', err);
    throw err;
  }
}

export async function signUp({ email, password, nome, perfil = 'operador' }: SignUpCredentials) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nome,
        perfil,
      },
    },
  });

  if (error) {
    console.error('Erro ao criar usuário:', error.message);
    throw new Error(error.message);
  }

  console.log('Usuário criado com sucesso:', data.user?.email);
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw new Error(error.message);
  }
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getUserProfile() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }
  
  const { data, error } = await supabase
    .from('equipe')
    .select('*')
    .eq('email', user.email)
    .single();
  
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data;
}
