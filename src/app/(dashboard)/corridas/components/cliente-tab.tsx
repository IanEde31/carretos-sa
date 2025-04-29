/**
 * ClienteTab.tsx
 * Aba de informações do cliente para o formulário de nova corrida.
 * Contém os campos de nome, contato, email e empresa do cliente.
 */

import React from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Mail, Building, ArrowRight } from 'lucide-react';
import { NovaCorrridaValues } from './NovaCorridaModal';

interface ClienteTabProps {
  form: UseFormReturn<NovaCorrridaValues>;
  onProximoClick: () => void;
}

const ClienteTab: React.FC<ClienteTabProps> = ({ form, onProximoClick }) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <User className="h-5 w-5 text-blue-500" />
            Informações do Cliente
            <Badge variant="outline" className="ml-2 text-xs font-normal">Etapa 1 de 3</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="cliente_nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nome do Cliente *
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nome completo" 
                      {...field} 
                      className="focus:border-blue-500" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="cliente_contato"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Telefone de Contato *
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="(00) 00000-0000" 
                      type="tel"
                      {...field} 
                      className="focus:border-blue-500" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="cliente_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="email@exemplo.com" 
                      type="email"
                      {...field} 
                      className="focus:border-blue-500" 
                    />
                  </FormControl>
                  <FormDescription>
                    Opcional, para enviar atualizações sobre a corrida
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="cliente_empresa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Empresa
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nome da empresa (opcional)" 
                      {...field} 
                      className="focus:border-blue-500" 
                    />
                  </FormControl>
                  <FormDescription>
                    Caso o cliente esteja vinculado a uma empresa
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={onProximoClick}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          Próximo: Endereços
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ClienteTab;
