/**
 * Hook personalizado para gerenciar a lista de motoristas e suas operações
 * Encapsula a lógica de carregamento, criação, atualização e exclusão de motoristas
 */

import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import {
  createMotorista,
  getMotoristas,
  updateMotoristaStatus,
  deleteMotorista,
  type Motorista,
  type MotoristaFormData
} from '@/lib/supabase/motoristas';

export function useMotoristas() {
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Função para carregar motoristas
  async function loadMotoristas() {
    try {
      setIsLoading(true);
      const data = await getMotoristas();
      setMotoristas(data);
    } catch (error) {
      console.error('Erro ao carregar motoristas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a lista de motoristas.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Carregar motoristas ao montar o componente
  useEffect(() => {
    loadMotoristas();
  }, []);

  // Função para criar um novo motorista
  async function handleCreate(formData: MotoristaFormData) {
    try {
      const novoMotorista = await createMotorista(formData);
      
      // Atualizar a lista de motoristas
      setMotoristas(prev => [...prev, novoMotorista]);
      
      return novoMotorista;
    } catch (error) {
      console.error('Erro ao criar novo motorista:', error);
      throw error;
    }
  }

  // Função para alterar o status de um motorista
  async function handleStatusChange(id: string, novoStatus: string) {
    try {
      await updateMotoristaStatus(id, novoStatus);
      
      // Atualizar a lista de motoristas
      setMotoristas(prev => 
        prev.map(motorista => 
          motorista.id === id ? {...motorista, status: novoStatus} : motorista
        )
      );
      
      toast({
        title: 'Sucesso',
        description: `Status do motorista alterado para ${novoStatus}.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Erro ao atualizar status do motorista:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status do motorista.',
        variant: 'destructive',
      });
      throw error;
    }
  }

  // Função para excluir um motorista
  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este motorista?')) return;
    
    try {
      await deleteMotorista(id);
      
      // Remover da lista de motoristas
      setMotoristas(prev => prev.filter(motorista => motorista.id !== id));
      
      toast({
        title: 'Sucesso',
        description: 'Motorista excluído com sucesso.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Erro ao excluir motorista:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o motorista.',
        variant: 'destructive',
      });
      throw error;
    }
  }

  return {
    motoristas,
    isLoading,
    loadMotoristas,
    handleCreate,
    handleStatusChange,
    handleDelete
  };
}