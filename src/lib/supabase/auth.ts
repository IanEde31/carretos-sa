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

/**
 * Convida um novo usuário via e-mail para criar senha
 * @param email Email do usuário a ser convidado
 * @param metadata Dados adicionais a serem armazenados no perfil do usuário
 * @param redirectTo URL para redirecionamento após configuração de senha (opcional)
 * @returns Objeto com status da operação e ID do usuário criado
 */
export async function inviteUserByEmail(
  email: string,
  metadata: Record<string, any>,
  redirectTo?: string
): Promise<{ success: boolean; userId?: string; error?: any }> {
  try {
    console.log(`Convidando usuário: ${email}`);
    
    // Criar uma senha temporária forte para o cadastro inicial
    const tempPassword = Math.random().toString(36).slice(2) + 
                       Math.random().toString(36).toUpperCase().slice(2) + 
                       Math.random().toString(16).slice(2) + 
                       '!@#$';
    
    // Usar o método signUp (API pública) em vez de admin.createUser
    const { data, error } = await supabase.auth.signUp({
      email,
      password: tempPassword,
      options: {
        data: metadata, // Adicionar os metadados do usuário
        emailRedirectTo: redirectTo || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/autenticacao/reset-senha`
      }
    });

    if (error) {
      console.error('Erro ao criar usuário de autenticação:', error);
      return { success: false, error: error.message };
    }
    
    if (!data.user) {
      console.error('Usuário não foi criado corretamente');
      return { success: false, error: 'Falha ao criar usuário' };
    }
    
    // Enviar email para redefinição de senha imediatamente após o cadastro
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/autenticacao/reset-senha`
    });
    
    if (resetError) {
      console.error('Erro ao enviar email de redefinição de senha:', resetError);
      // Mesmo com erro no envio do email, o usuário foi criado
      return { success: true, userId: data.user.id, error: resetError.message };
    }

    console.log('Usuário convidado com sucesso:', data.user.id);
    return { success: true, userId: data.user.id };
  } catch (error) {
    console.error('Exceção ao convidar usuário:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}
