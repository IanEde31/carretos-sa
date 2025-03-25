// Script para exportar o conteúdo SQL para o clipboard ou um arquivo

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Lê o arquivo SQL
const sqlFile = path.join(__dirname, 'supabase-schema.sql');
const sqlContent = fs.readFileSync(sqlFile, 'utf8');

// Cria um arquivo temporário com o conteúdo SQL
const tempFile = path.join(__dirname, 'temp-sql-export.sql');
fs.writeFileSync(tempFile, sqlContent, 'utf8');

console.log('\n=== INSTRUÇÕES PARA CONFIGURAÇÃO MANUAL DO BANCO DE DADOS ===\n');
console.log('Devido a limitações na API do Supabase, você precisará executar o script SQL manualmente:');
console.log('');
console.log('1. Acesse o Dashboard do Supabase: https://app.supabase.com');
console.log('2. Selecione seu projeto');
console.log('3. Vá para "SQL Editor" no menu lateral');
console.log('4. Crie uma nova consulta (New query)');
console.log('5. Copie e cole o conteúdo do arquivo supabase-schema.sql');
console.log('   - O arquivo temporário foi criado em: ' + tempFile);
console.log('   - Abra este arquivo e copie todo o conteúdo');
console.log('6. Execute o script clicando em "Run"');
console.log('\nApós executar o script com sucesso:');
console.log('1. Execute "node create-admin-user.js" para criar um usuário administrador');
console.log('2. Inicie o aplicativo com "npm run dev"');
console.log('3. Faça login com as credenciais do administrador\n');

// Tenta abrir o arquivo automaticamente
try {
  let command = '';
  
  // Detecta o sistema operacional e escolhe o comando apropriado
  if (process.platform === 'win32') {
    command = `start ${tempFile}`;
  } else if (process.platform === 'darwin') {
    command = `open ${tempFile}`;
  } else {
    command = `xdg-open ${tempFile}`;
  }
  
  exec(command, (error) => {
    if (error) {
      console.log(`Não foi possível abrir o arquivo automaticamente. Por favor, abra manualmente em: ${tempFile}`);
    } else {
      console.log('O arquivo SQL foi aberto automaticamente para você copiar o conteúdo.');
    }
  });
} catch (e) {
  console.log(`Não foi possível abrir o arquivo automaticamente. Por favor, abra manualmente em: ${tempFile}`);
}
