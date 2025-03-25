import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { getUserProfile } from '@/lib/supabase/auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const profileSchema = z.object({
  nome: z.string().min(2, {
    message: 'O nome deve ter pelo menos 2 caracteres.',
  }),
  email: z.string().email({
    message: 'Insira um email válido.',
  }),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, {
    message: 'A senha atual deve ter pelo menos 6 caracteres.',
  }),
  newPassword: z.string().min(6, {
    message: 'A nova senha deve ter pelo menos 6 caracteres.',
  }),
  confirmPassword: z.string().min(6, {
    message: 'A confirmação da senha deve ter pelo menos 6 caracteres.',
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'As senhas não coincidem.',
  path: ['confirmPassword'],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function PerfilPage() {
  const [user, setUser] = useState<{ nome: string; email: string } | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nome: '',
      email: '',
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const profile = await getUserProfile();
        if (profile) {
          setUser(profile);
          profileForm.reset({
            nome: profile.nome || '',
            email: profile.email || '',
          });
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    }

    loadUserProfile();
  }, [profileForm]);

  async function onProfileSubmit(data: ProfileFormValues) {
    setIsUpdatingProfile(true);
    
    try {
      // Aqui iríamos fazer uma chamada à API do Supabase para atualizar os dados
      console.log('Dados atualizados do perfil:', data);
      
      // Simulando um atraso na resposta da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Atualizar o estado local com os novos dados
      setUser(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    } finally {
      setIsUpdatingProfile(false);
    }
  }

  async function onPasswordSubmit(data: PasswordFormValues) {
    setIsUpdatingPassword(true);
    
    try {
      // Aqui iríamos fazer uma chamada à API do Supabase para atualizar a senha
      console.log('Dados da nova senha:', data);
      
      // Simulando um atraso na resposta da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Resetar o formulário
      passwordForm.reset();
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
    } finally {
      setIsUpdatingPassword(false);
    }
  }

  // Função para obter as iniciais do nome
  const getInitials = () => {
    if (!user?.nome) return '?';
    
    const names = user.nome.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e senha
        </p>
      </div>

      <Tabs defaultValue="account" className="w-full max-w-4xl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="account">Conta</TabsTrigger>
          <TabsTrigger value="password">Senha</TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="space-y-4 mt-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center justify-center p-6 border rounded-md w-full md:w-64">
              <Avatar className="h-20 w-20 md:h-24 md:w-24 mb-4">
                <AvatarFallback className="text-xl md:text-2xl">{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="font-medium">{user?.nome || 'Usuário'}</h3>
                <p className="text-sm text-muted-foreground break-all">{user?.email}</p>
              </div>
            </div>
            <Card className="flex-1">
              <CardHeader className="p-4 md:p-6">
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu nome completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="seu@email.com" {...field} disabled />
                          </FormControl>
                          <FormDescription>
                            O email não pode ser alterado.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      disabled={isUpdatingProfile}
                      className="w-full sm:w-auto"
                    >
                      {isUpdatingProfile ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="password" className="mt-4">
          <Card className="w-full">
            <CardHeader className="p-4 md:p-6">
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>
                Atualize sua senha de acesso
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha Atual</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="******" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nova Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="******" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Nova Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="******" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isUpdatingPassword}
                      className="w-full sm:w-auto"
                    >
                      {isUpdatingPassword ? 'Atualizando...' : 'Atualizar Senha'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
