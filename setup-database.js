// Script para configurar o banco de dados no Supabase

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const https = require('https');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(`
Erro: As variáveis de ambiente necessárias não foram encontradas.

Para executar este script, você precisa adicionar a chave de serviço do Supabase ao arquivo .env.local:

SUPABASE_SERVICE_KEY=sua_chave_aqui

Você pode encontrar a chave de serviço (service_role key) no Supabase Dashboard:
1. Acesse o painel do Supabase (https://app.supabase.io)
2. Selecione seu projeto
3. Vá para Settings > API
4. Copie a "service_role key" (não a anon key)
5. Adicione a chave ao seu arquivo .env.local

ATENÇÃO: Esta chave tem privilégios administrativos e não deve ser exposta publicamente!
`);
  process.exit(1);
}

// Cria cliente Supabase com a chave de serviço para ter acesso administrativo
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Lê o arquivo SQL
const sqlFile = path.join(__dirname, 'supabase-schema.sql');
const sqlContent = fs.readFileSync(sqlFile, 'utf8');

async function executeSQL() {
  console.log('Iniciando configuração do banco de dados...');
  
  try {
    // Executa o script SQL diretamente usando a API REST do Supabase
    const { data, error } = await supabase.from('_sqlj').select('*').execute(sqlContent);
    
    if (error) {
      console.error('Erro ao executar o script SQL:', error.message);
      console.error('Detalhes:', error.details);
    } else {
      console.log('✓ Script SQL executado com sucesso!');
    }
  } catch (error) {
    console.error('Erro ao executar o script SQL:', error.message);
    
    // Uma abordagem alternativa é usar diretamente a API REST do Supabase
    console.log('\nTentando método alternativo...');
    
    try {
      const hostname = new URL(supabaseUrl).hostname;
      const options = {
        hostname: hostname,
        path: '/rest/v1/sql',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        }
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log('✓ Script SQL executado com sucesso!');
          } else {
            console.error('Erro na resposta da API Supabase:', res.statusCode);
            console.error('Detalhes:', data);
            console.log('\n');
            console.log('Recomendação: Execute o script SQL manualmente no Editor SQL do Supabase:');
            console.log('1. Acesse o Dashboard do Supabase');
            console.log('2. Vá para "SQL Editor"');
            console.log('3. Copie e cole o conteúdo do arquivo supabase-schema.sql');
            console.log('4. Execute o script');
          }
        });
      });
      
      req.on('error', (e) => {
        console.error('Erro na requisição HTTP:', e.message);
      });
      
      req.write(JSON.stringify({ query: sqlContent }));
      req.end();
    } catch (httpError) {
      console.error('Erro ao fazer requisição HTTP:', httpError.message);
      console.log('\n');
      console.log('Como alternativa, execute o script SQL manualmente:');
      console.log('1. Acesse o Dashboard do Supabase');
      console.log('2. Vá para "SQL Editor"');
      console.log('3. Copie e cole o conteúdo do arquivo supabase-schema.sql');
      console.log('4. Execute o script');
    }
  }
  
  console.log('\nPróximos passos:');
  console.log('1. Execute "node create-admin-user.js" para criar um usuário administrador');
  console.log('2. Inicie o aplicativo com "npm run dev"');
  console.log('3. Faça login com as credenciais do administrador');
}

executeSQL();
