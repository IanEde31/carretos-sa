'use client';

/**
 * Aba de informações do veículo do formulário de motoristas
 */

import { FormTabProps } from '../../utils/types';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage, 
  FormDescription 
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { getTiposVeiculos } from '@/lib/supabase/motoristas';
import { useEffect, useState } from 'react';

// Tipo para listar os tipos de veículos
type TipoVeiculo = {
  id: string;
  nome: string;
};

export function VehicleTab({ form }: FormTabProps) {
  // Estado para armazenar os tipos de veículos
  const [tiposVeiculos, setTiposVeiculos] = useState<TipoVeiculo[]>([]);
  
  // Carrega os tipos de veículos ao montar o componente
  useEffect(() => {
    const loadTiposVeiculos = async () => {
      try {
        const tipos = await getTiposVeiculos();
        setTiposVeiculos(tipos);
      } catch (error) {
        console.error('Erro ao carregar tipos de veículos:', error);
        // Fallback para tipos padrão caso a API falhe
        setTiposVeiculos([
          { id: 'carro', nome: 'Carro de Passeio' },
          { id: 'moto', nome: 'Moto' },
          { id: 'van', nome: 'Van' },
          { id: 'caminhao_pequeno', nome: 'Caminhão Pequeno (3/4)' },
          { id: 'caminhao_medio', nome: 'Caminhão Médio (Toco)' },
          { id: 'caminhao_grande', nome: 'Caminhão Grande (Truck)' }
        ]);
      }
    };
    
    loadTiposVeiculos();
  }, []);

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="veiculo_tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Veículo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de veículo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tiposVeiculos.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id}>{tipo.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="placa_veiculo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Placa do Veículo</FormLabel>
                <FormControl>
                  <Input placeholder="ABC1D23" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="veiculo_descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição do Veículo</FormLabel>
              <FormControl>
                <Input placeholder="Marca, modelo, ano, cor" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="capacidade_carga"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacidade de Carga (kg)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Ex: 1000" 
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                />
              </FormControl>
              <FormMessage />
              <FormDescription>
                Capacidade máxima de carga em quilos
              </FormDescription>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
