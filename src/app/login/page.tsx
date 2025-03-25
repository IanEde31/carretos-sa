import Image from 'next/image';
import { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Login | Carretos.sa',
  description: 'Entre na sua conta Carretos.sa',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 to-teal-800 flex items-center justify-center p-4 md:p-8">
      <div className="grid md:grid-cols-2 gap-8 max-w-6xl w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
        <div className="hidden md:flex md:flex-col p-10 bg-teal-700 text-white justify-between">
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Image 
                src="/logo.svg" 
                width={50} 
                height={50} 
                alt="Carretos.sa"
                className="w-12 h-12" 
              />
              <h1 className="text-2xl font-bold">Carretos.sa</h1>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Bem-vindo de volta</h2>
              <p className="text-teal-100 max-w-sm">
                Acesse sua conta para gerenciar motoristas, solicitações e corridas de forma eficiente.
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 bg-teal-800 rounded-full p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p>Gestão completa de motoristas</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 bg-teal-800 rounded-full p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p>Controle de solicitações em tempo real</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 bg-teal-800 rounded-full p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p>Relatórios e análises de desempenho</p>
            </div>
          </div>
        </div>
        
        <div className="p-10 flex flex-col justify-center">
          <div className="md:hidden flex flex-col items-center mb-8">
            <Image 
              src="/logo.svg" 
              width={80} 
              height={80} 
              alt="Carretos.sa"
              className="w-16 h-16 mb-4" 
            />
            <h1 className="text-2xl font-bold text-teal-700">Carretos.sa</h1>
          </div>
          
          <div className="space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Acesse sua conta</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Entre com suas credenciais para acessar o painel administrativo
            </p>
          </div>
          
          <LoginForm />
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Precisa de ajuda? Entre em contato com o suporte técnico</p>
          </div>
        </div>
      </div>
    </div>
  );
}
