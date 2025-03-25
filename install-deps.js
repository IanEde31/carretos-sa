// Script para instalar as dependências necessárias para configuração do Supabase

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Instalando dependências necessárias para configuração do Supabase...');

try {
  // Verifica se dotenv já está instalado
  try {
    require.resolve('dotenv');
    console.log('✓ dotenv já está instalado');
  } catch (e) {
    console.log('Instalando dotenv...');
    execSync('npm install dotenv', { stdio: 'inherit' });
  }
  
  // Verifica se o pacote do Supabase já está instalado
  try {
    require.resolve('@supabase/supabase-js');
    console.log('✓ @supabase/supabase-js já está instalado');
  } catch (e) {
    console.log('Instalando @supabase/supabase-js...');
    execSync('npm install @supabase/supabase-js', { stdio: 'inherit' });
  }
  
  // Verifica se o pacote readline já está instalado
  try {
    require.resolve('readline');
    console.log('✓ readline já está disponível no Node.js');
  } catch (e) {
    console.log('Readline é parte do Node.js core, não precisa ser instalado separadamente');
  }
  
  console.log('\nTodas as dependências necessárias foram instaladas com sucesso!');
  console.log('\nPróximos passos:');
  console.log('1. Configure as variáveis de ambiente no arquivo .env.local:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon');
  console.log('   SUPABASE_SERVICE_KEY=sua_service_role_key');
  console.log('\n2. Execute o script de configuração do banco de dados:');
  console.log('   npm run setup-db');
  console.log('\n3. Crie um usuário administrador:');
  console.log('   npm run create-admin');
  
} catch (error) {
  console.error('Erro ao instalar dependências:', error.message);
  process.exit(1);
}
