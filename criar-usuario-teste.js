// Script para criar um usuário de teste no Supabase
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Erro: Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_KEY precisam estar configuradas no arquivo .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function criarUsuario() {
  const email = 'admin@carretos.sa';
  const password = 'password123';
  const nome = 'Administrador';
  const perfil = 'administrador';

  try {
    // Verificar se o usuário já existe
    const { data: usuariosExistentes } = await supabase.auth.admin.listUsers();
    const usuarioExistente = usuariosExistentes.users.find(user => user.email === email);
    
    if (usuarioExistente) {
      console.log(`Usuário ${email} já existe. ID: ${usuarioExistente.id}`);
      return;
    }
    
    // Criar novo usuário
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nome,
        perfil
      }
    });

    if (error) {
      console.error('Erro ao criar usuário:', error.message);
      return;
    }

    console.log('Usuário criado com sucesso:', {
      id: data.user.id,
      email: data.user.email,
      metadata: data.user.user_metadata
    });
    
    // Inserir na tabela equipe
    const { error: eqError } = await supabase
      .from('equipe')
      .insert([
        { 
          id: data.user.id,
          nome,
          email,
          perfil
        }
      ]);
      
    if (eqError) {
      console.error('Erro ao inserir na tabela equipe:', eqError.message);
    } else {
      console.log('Registro inserido na tabela equipe');
    }
    
  } catch (err) {
    console.error('Erro inesperado:', err);
  }
}

criarUsuario().then(() => {
  console.log('Script finalizado');
});
