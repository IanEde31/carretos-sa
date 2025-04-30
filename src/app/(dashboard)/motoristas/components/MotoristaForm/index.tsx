'use client';

/**
 * Componente principal do formulário de motoristas
 * Organiza as abas e gerencia o envio do formulário
 */

import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMotoristaForm } from '../../hooks/useMotoristaForm';
import { MotoristaFormProps } from '../../utils/types';
import { PersonalInfoTab } from './PersonalInfoTab';
import { AddressTab } from './AddressTab';
import { VehicleTab } from './VehicleTab';
import { DocumentsTab } from './DocumentsTab';

export function MotoristaForm({ onSubmit, isSubmitting, defaultValues }: MotoristaFormProps) {
  // Usar o hook personalizado para gerenciar o formulário
  const { form, handleSubmit } = useMotoristaForm(onSubmit, defaultValues);
  
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="informacoes" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="informacoes">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="endereco">Endereço</TabsTrigger>
            <TabsTrigger value="veiculo">Veículo</TabsTrigger>
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
          </TabsList>
          
          {/* Aba de Informações Pessoais */}
          <TabsContent value="informacoes" className="mt-4">
            <PersonalInfoTab form={form} />
          </TabsContent>
          
          {/* Aba de Endereço */}
          <TabsContent value="endereco" className="mt-4">
            <AddressTab form={form} />
          </TabsContent>
          
          {/* Aba de Veículo */}
          <TabsContent value="veiculo" className="mt-4">
            <VehicleTab form={form} />
          </TabsContent>
          
          {/* Aba de Documentos */}
          <TabsContent value="documentos" className="mt-4">
            <DocumentsTab form={form} />
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground"></div>
                Salvando...
              </>
            ) : (
              'Salvar Motorista'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
