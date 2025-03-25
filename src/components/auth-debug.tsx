'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase, checkAuth } from '@/lib/supabase/config';
import { toast } from '@/components/ui/use-toast';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

export default function AuthDebug() {
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [sessionExpiry, setSessionExpiry] = useState<string | null>(null);

  const checkAuthentication = async () => {
    setAuthStatus('loading');
    try {
      const { data } = await checkAuth();
      
      if (data?.session) {
        setAuthStatus('authenticated');
        setUserId(data.session.user.id);
        setEmail(data.session.user.email);
        
        // Formatar data de expiração
        const expiryDate = new Date(data.session.expires_at! * 1000);
        setSessionExpiry(expiryDate.toLocaleString());
        
        // Testar uma consulta simples
        testQuery();
      } else {
        setAuthStatus('unauthenticated');
        setUserId(null);
        setEmail(null);
        setSessionExpiry(null);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setAuthStatus('unauthenticated');
      toast({
        title: 'Erro de autenticação',
        description: 'Não foi possível verificar o status da autenticação.',
        variant: 'destructive',
      });
    }
  };

  const testQuery = async () => {
    try {
      // Testar uma consulta simples para verificar políticas RLS
      const { data, error, count } = await supabase
        .from('motoristas')
        .select('*', { count: 'exact' });
      
      console.log('Teste de consulta:', { data, error, count });
      
      if (error) {
        toast({
          title: 'Erro na consulta',
          description: `Erro ao consultar dados: ${error.message}`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Consulta bem-sucedida',
          description: `Consultou ${count || 0} registros com sucesso.`,
          variant: 'default',
        });
      }
    } catch (e) {
      console.error('Erro no teste de consulta:', e);
    }
  };

  const refreshSession = async () => {
    try {
      const { error } = await supabase.auth.refreshSession();
      
      if (error) {
        toast({
          title: 'Falha ao atualizar sessão',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Sessão atualizada',
          description: 'A sessão foi atualizada com sucesso.',
          variant: 'default',
        });
        checkAuthentication();
      }
    } catch (error) {
      console.error('Erro ao atualizar sessão:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao tentar atualizar a sessão.',
        variant: 'destructive',
      });
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'Logout realizado',
        description: 'Você foi desconectado com sucesso.',
        variant: 'default',
      });
      checkAuthentication();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao tentar fazer logout.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    checkAuthentication();
    
    // Inscrever-se para mudanças de estado de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAuthStatus('authenticated');
        setUserId(session.user.id);
        setEmail(session.user.email);
        
        const expiryDate = new Date(session.expires_at! * 1000);
        setSessionExpiry(expiryDate.toLocaleString());
      } else {
        setAuthStatus('unauthenticated');
        setUserId(null);
        setEmail(null);
        setSessionExpiry(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [checkAuthentication]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Status de Autenticação
          {authStatus === 'loading' ? (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
              Verificando...
            </Badge>
          ) : authStatus === 'authenticated' ? (
            <Badge variant="outline" className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" /> Autenticado
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-red-100 text-red-800">
              <AlertCircle className="w-3 h-3 mr-1" /> Não Autenticado
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Verifique e gerencie o status da sessão do Supabase
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {authStatus === 'authenticated' ? (
          <>
            <div className="space-y-2">
              <p className="text-sm font-medium">Usuário:</p>
              <p className="text-sm">{email}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">ID do Usuário:</p>
              <p className="text-sm text-muted-foreground overflow-x-auto">{userId}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Sessão expira em:</p>
              <p className="text-sm">{sessionExpiry}</p>
            </div>
          </>
        ) : authStatus === 'unauthenticated' ? (
          <p className="text-sm text-center py-4">
            Você precisa estar autenticado para acessar os dados.
            <br />
            Por favor, faça login novamente.
          </p>
        ) : (
          <div className="flex justify-center py-4">
            <RefreshCw className="animate-spin h-8 w-8 text-muted-foreground" />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={checkAuthentication}
          disabled={authStatus === 'loading'}
        >
          Verificar Status
        </Button>
        {authStatus === 'authenticated' ? (
          <div className="space-x-2">
            <Button 
              variant="secondary"
              onClick={refreshSession}
              disabled={authStatus === 'loading'}
            >
              Atualizar Sessão
            </Button>
            <Button 
              variant="destructive"
              onClick={signOut}
              disabled={authStatus === 'loading'}
            >
              Logout
            </Button>
          </div>
        ) : (
          <Button 
            variant="default"
            onClick={() => window.location.href = '/login'}
            disabled={authStatus === 'loading'}
          >
            Ir para Login
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
