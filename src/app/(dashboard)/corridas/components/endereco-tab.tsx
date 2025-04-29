/**
 * EnderecoTab.tsx
 * Aba de endereços para o formulário de nova corrida.
 * Contém os campos de origem e destino, com busca automática por CEP.
 */

import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';
import { 
  MapPin, 
  Search, 
  Building, 
  Home, 
  ArrowLeft, 
  ArrowRight, 
  Loader2,
} from 'lucide-react';
import { NovaCorrridaValues } from './NovaCorridaModal';

// Interface para o resultado da busca de CEP
interface CepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

interface EnderecoTabProps {
  form: UseFormReturn<NovaCorrridaValues>;
  onAnteriorClick: () => void;
  onProximoClick: () => void;
}

const EnderecoTab: React.FC<EnderecoTabProps> = ({ form, onAnteriorClick, onProximoClick }) => {
  // Estados locais
  const [buscandoCepOrigem, setBuscandoCepOrigem] = useState(false);
  const [buscandoCepDestino, setBuscandoCepDestino] = useState(false);
  const [erroCepOrigem, setErroCepOrigem] = useState<string | null>(null);
  const [erroCepDestino, setErroCepDestino] = useState<string | null>(null);

  // Função para buscar endereço pelo CEP - usando a API ViaCEP
  const buscarCep = async (cep: string | undefined, tipo: 'origem' | 'destino') => {
    if (!cep) {
      if (tipo === 'origem') {
        setErroCepOrigem('CEP não informado');
      } else {
        setErroCepDestino('CEP não informado');
      }
      return;
    }
    // Limpar CEP - remover qualquer caractere não numérico
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) {
      if (tipo === 'origem') {
        setErroCepOrigem('CEP deve ter 8 dígitos');
      } else {
        setErroCepDestino('CEP deve ter 8 dígitos');
      }
      return;
    }
    
    try {
      // Iniciar busca
      if (tipo === 'origem') {
        setBuscandoCepOrigem(true);
        setErroCepOrigem(null);
      } else {
        setBuscandoCepDestino(true);
        setErroCepDestino(null);
      }
      
      // Fazer a requisição para a API ViaCEP
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json() as CepResponse;
      
      if (data.erro) {
        throw new Error('CEP não encontrado');
      }
      
      // Preencher os campos com os dados recebidos
      if (tipo === 'origem') {
        form.setValue('endereco_origem', data.logradouro || '');
        form.setValue('bairro_origem', data.bairro || '');
        form.setValue('cidade_origem', data.localidade || '');
        form.setValue('estado_origem', data.uf || '');
        // Formatá-lo com máscara
        form.setValue('cep_origem', data.cep);
        
        // Dar foco ao campo de número
        setTimeout(() => {
          const numeroInput = document.getElementById('numero_origem');
          numeroInput?.focus();
        }, 100);
      } else {
        form.setValue('endereco_destino', data.logradouro || '');
        form.setValue('bairro_destino', data.bairro || '');
        form.setValue('cidade_destino', data.localidade || '');
        form.setValue('estado_destino', data.uf || '');
        // Formatá-lo com máscara
        form.setValue('cep_destino', data.cep);
        
        // Dar foco ao campo de número
        setTimeout(() => {
          const numeroInput = document.getElementById('numero_destino');
          numeroInput?.focus();
        }, 100);
      }
      
      // Notificar usuário do sucesso
      toast({
        title: "CEP encontrado",
        description: `Endereço preenchido automaticamente`,
      });
      
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      if (tipo === 'origem') {
        setErroCepOrigem('CEP não encontrado');
      } else {
        setErroCepDestino('CEP não encontrado');
      }
      
      toast({
        title: "Erro",
        description: `CEP não encontrado. Preencha o endereço manualmente.`,
        variant: "destructive",
      });
    } finally {
      if (tipo === 'origem') {
        setBuscandoCepOrigem(false);
      } else {
        setBuscandoCepDestino(false);
      }
    }
  };
  
  // Função para formatar CEP automaticamente (00000-000)
  const formatarCep = (cep: string) => {
    // Remover caracteres não numéricos
    const numeros = cep.replace(/\D/g, '');
    
    // Formatar com a máscara
    if (numeros.length <= 5) {
      return numeros;
    } else {
      return `${numeros.slice(0, 5)}-${numeros.slice(5, 8)}`;
    }
  };
  
  // Lidando com mudança no campo de CEP
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>, tipo: 'origem' | 'destino') => {
    const { value } = e.target;
    const cepFormatado = formatarCep(value);
    
    if (tipo === 'origem') {
      form.setValue('cep_origem', cepFormatado);
    } else {
      form.setValue('cep_destino', cepFormatado);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Endereço de Origem */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Home className="h-5 w-5 text-green-500" />
              Endereço de Origem
            </CardTitle>
            <Badge variant="outline" className="text-xs font-normal">Etapa 2 de 3</Badge>
          </div>
          <CardDescription>Local onde a carga será coletada</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-end gap-2">
              <FormField
                control={form.control}
                name="cep_origem"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      CEP *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          id="cep_origem"
                          placeholder="00000-000" 
                          {...field}
                          onChange={(e) => handleCepChange(e, 'origem')}
                          className="focus:border-green-500" 
                        />
                      </div>
                    </FormControl>
                    {erroCepOrigem && (
                      <FormDescription className="text-red-500">
                        {erroCepOrigem}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="button" 
                variant="outline" 
                className="flex gap-2 border-green-500 text-green-600"
                onClick={() => buscarCep(form.getValues('cep_origem'), 'origem')}
                disabled={buscandoCepOrigem}
              >
                {buscandoCepOrigem ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Buscar
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="endereco_origem"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Logradouro *
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nome da rua, avenida, etc." 
                        {...field} 
                        className="focus:border-green-500" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="numero_origem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número *</FormLabel>
                    <FormControl>
                      <Input 
                        id="numero_origem"
                        placeholder="123" 
                        {...field} 
                        className="focus:border-green-500" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="complemento_origem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complemento</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Apto, sala, conjunto, etc." 
                        {...field} 
                        className="focus:border-green-500" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bairro_origem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Bairro" 
                        {...field} 
                        className="focus:border-green-500" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cidade_origem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Cidade" 
                        {...field} 
                        className="focus:border-green-500" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="estado_origem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UF *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="UF" 
                        maxLength={2}
                        {...field} 
                        className="focus:border-green-500" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="ponto_referencia_origem"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Ponto de Referência</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Próximo ao mercado, esquina com..." 
                        {...field} 
                        className="focus:border-green-500" 
                      />
                    </FormControl>
                    <FormDescription>
                      Informações adicionais para facilitar a localização
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Endereço de Destino */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Building className="h-5 w-5 text-purple-500" />
            Endereço de Destino
          </CardTitle>
          <CardDescription>Local onde a carga será entregue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-end gap-2">
              <FormField
                control={form.control}
                name="cep_destino"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      CEP *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          id="cep_destino"
                          placeholder="00000-000" 
                          {...field}
                          onChange={(e) => handleCepChange(e, 'destino')}
                          className="focus:border-purple-500" 
                        />
                      </div>
                    </FormControl>
                    {erroCepDestino && (
                      <FormDescription className="text-red-500">
                        {erroCepDestino}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="button" 
                variant="outline" 
                className="flex gap-2 border-purple-500 text-purple-600"
                onClick={() => buscarCep(form.getValues('cep_destino'), 'destino')}
                disabled={buscandoCepDestino}
              >
                {buscandoCepDestino ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Buscar
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="endereco_destino"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Logradouro *
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nome da rua, avenida, etc." 
                        {...field} 
                        className="focus:border-purple-500" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="numero_destino"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número *</FormLabel>
                    <FormControl>
                      <Input 
                        id="numero_destino"
                        placeholder="123" 
                        {...field} 
                        className="focus:border-purple-500" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="complemento_destino"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complemento</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Apto, sala, conjunto, etc." 
                        {...field} 
                        className="focus:border-purple-500" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bairro_destino"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Bairro" 
                        {...field} 
                        className="focus:border-purple-500" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cidade_destino"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Cidade" 
                        {...field} 
                        className="focus:border-purple-500" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="estado_destino"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UF *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="UF" 
                        maxLength={2}
                        {...field} 
                        className="focus:border-purple-500" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="ponto_referencia_destino"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Ponto de Referência</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Próximo ao mercado, esquina com..." 
                        {...field} 
                        className="focus:border-purple-500" 
                      />
                    </FormControl>
                    <FormDescription>
                      Informações adicionais para facilitar a localização
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Botões de navegação */}
      <div className="flex justify-between">
        <Button
          type="button"
          onClick={onAnteriorClick}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Cliente
        </Button>
        <Button
          type="button"
          onClick={onProximoClick}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
        >
          Próximo: Carga
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default EnderecoTab;
