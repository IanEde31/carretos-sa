'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Mail, Lock, User, AlertCircle } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  nome: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres' }),
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
  confirmPassword: z.string().min(6, { message: 'A confirmação deve ter pelo menos 6 caracteres' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não correspondem",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof formSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  
  async function onSubmit(values: RegisterFormValues) {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Registrando novo usuário:', values.email);
      
      // Criar usuário no Auth do Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            nome: values.nome,
            perfil: 'admin', // Perfil padrão para usuários do painel administrativo
          },
        },
      });
      
      if (authError) {
        console.error('Erro ao criar usuário:', authError.message);
        throw new Error(authError.message);
      }
      
      console.log('Usuário criado com sucesso:', authData);
      
      // Criar registro na tabela equipe
      const { error: equipeError } = await supabase
        .from('equipe')
        .insert({
          nome: values.nome,
          email: values.email,
          perfil: 'admin',
          auth_id: authData.user?.id
        });
      
      if (equipeError) {
        console.error('Erro ao criar registro na equipe:', equipeError.message);
        throw new Error('Erro ao completar cadastro. Entre em contato com o suporte.');
      }
      
      // Login automático
      await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      
      console.log('Cadastro finalizado com sucesso!');
      
      // Redirecionamento para o dashboard
      router.push('/');
      
    } catch (error) {
      console.error('Erro no cadastro:', error);
      setError(error instanceof Error ? error.message : 'Falha no cadastro. Tente novamente.');
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
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 md:text-white">Nome completo</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 md:text-gray-300" />
                    <Input 
                      placeholder="Seu nome completo"
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
                <FormLabel className="text-gray-700 md:text-white">Senha</FormLabel>
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
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 md:text-white">Confirme sua senha</FormLabel>
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
              className="w-full h-11 bg-[#2f2eb7] hover:bg-blue-800 text-white font-medium rounded-lg text-base md:bg-white/10 md:backdrop-blur-sm md:hover:bg-white/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar conta'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
