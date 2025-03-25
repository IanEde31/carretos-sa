// Script para criar o primeiro usuário administrador no Supabase

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Erro: As variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY precisam estar definidas no arquivo .env.local');
  process.exit(1);
}

// Perguntar ao usuário para inserir email e senha
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question('Digite o email para o usuário administrador: ', (email) => {
  readline.question('Digite a senha para o usuário administrador (mínimo 6 caracteres): ', async (password) => {
    readline.question('Digite o nome completo do administrador: ', async (nome) => {
      try {
        // Inicializar o cliente do Supabase
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        
        // Registrar o usuário usando a API do Supabase
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nome,
              perfil: 'administrador',
            },
          }
        });
        
        if (error) {
          console.error('Erro ao criar o usuário:', error.message);
        } else {
          console.log('Usuário criado com sucesso!');
          console.log('Detalhes do usuário:');
          console.log(`  Email: ${email}`);
          console.log(`  Nome: ${nome}`);
          console.log(`  Perfil: administrador`);
          console.log('Um email de confirmação pode ter sido enviado para o endereço fornecido.');
          console.log('Verifique as configurações de email no Supabase para ativar este recurso.');
        }
      } catch (err) {
        console.error('Erro ao executar o script:', err.message);
      } finally {
        readline.close();
      }
    });
  });
});
