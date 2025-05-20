import Image from 'next/image';
import { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Login | FreteFácil Brasil',
  description: 'Entre na sua conta FreteFácil Brasil',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 md:p-8">
      {/* Logo no topo (área do retângulo vermelho) */}
      <div className="w-full max-w-6xl mb-8 flex justify-center">
        <Image 
          src="/LogoPNG.png" 
          width={300} 
          height={100} 
          alt="FreteFácil Brasil"
          className="h-16 w-auto object-contain" 
          priority
        />
      </div>
      
      {/* Container principal com degradê */}
      <div className="grid md:grid-cols-2 gap-0 max-w-6xl w-full bg-gradient-to-br from-[#040300] to-[#2f2eb7] rounded-2xl shadow-xl overflow-hidden">
        <div className="hidden md:flex md:flex-col p-10 text-white justify-between">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Bem-vindo de volta</h2>
              <p className="text-white max-w-sm">
                Acesse sua conta para gerenciar motoristas, solicitações e corridas de forma eficiente.
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-full p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p>Gestão completa de motoristas</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-full p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p>Controle de solicitações em tempo real</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-full p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p>Relatórios e análises de desempenho</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white md:bg-transparent p-10 flex flex-col justify-center rounded-lg md:rounded-none m-2 md:m-0">
          <div className="md:hidden flex flex-col items-center mb-8">
            <h2 className="text-2xl font-bold text-[#2f2eb7]">Bem-vindo de volta</h2>
            <p className="text-gray-600 text-center mt-2">
              Acesse sua conta para gerenciar corridas
            </p>
          </div>
          
          <div className="space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 md:text-white">Acesse sua conta</h2>
            <p className="text-gray-600 md:text-gray-200">
              Entre com suas credenciais para acessar o painel administrativo
            </p>
          </div>
          
          <LoginForm />
          
          <div className="mt-6 text-center text-sm text-gray-500 md:text-gray-200">
            <p>Precisa de ajuda? Entre em contato com o suporte técnico</p>
          </div>
        </div>
      </div>
    </div>
  );
}
