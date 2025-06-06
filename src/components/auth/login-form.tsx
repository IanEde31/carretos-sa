'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
});

type LoginFormValues = z.infer<typeof formSchema>;

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Tentando fazer login com:', values.email);
      
      // Chamando diretamente o supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      
      if (error) {
        console.error('Erro de autenticação:', error.message);
        throw new Error(error.message);
      }
      
      console.log('Resposta do login:', data);
      
      if (data?.session) {
        console.log('Login bem-sucedido!');
        
        // Redirecionamento para o dashboard
        router.push('/');
      } else {
        console.error('Sessão não encontrada na resposta');
        setError('Não foi possível iniciar a sessão. Tente novamente.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError(error instanceof Error ? error.message : 'Falha no login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full">
      {error && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-lg flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 md:text-white">Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 md:text-gray-300" />
                    <Input 
                      placeholder="seu@email.com"
                      className="pl-10 h-11 bg-white md:bg-white/10 md:backdrop-blur-sm border-gray-200 md:border-white/20 text-gray-900 md:text-white"
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel className="text-gray-700 md:text-white">Senha</FormLabel>
                  <a href="#" className="text-sm font-medium text-[#2f2eb7] hover:text-blue-800 md:text-white md:hover:text-gray-200">
                    Esqueceu a senha?
                  </a>
                </div>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 md:text-gray-300" />
                    <Input 
                      type="password"
                      placeholder="••••••"
                      className="pl-10 h-11 bg-white md:bg-white/10 md:backdrop-blur-sm border-gray-200 md:border-white/20 text-gray-900 md:text-white"
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          
          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full h-11 bg-[#2f2eb7] hover:bg-blue-800 text-white font-medium rounded-lg text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
            
            <div className="mt-4 text-center">
              <span className="text-sm text-gray-600 md:text-white">Não tem uma conta? </span>
              <a 
                href="/cadastro" 
                className="text-sm font-medium text-[#2f2eb7] hover:text-blue-800 md:text-white md:hover:text-gray-200 hover:underline"
              >
                Criar conta
              </a>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
