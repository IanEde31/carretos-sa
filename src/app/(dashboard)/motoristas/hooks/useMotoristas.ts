/**
 * Hook para gerenciar operações relacionadas aos motoristas
 * Encapsula a lógica de carregamento, criação, atualização e exclusão de motoristas
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  getMotoristas, 
  createMotorista, 
  updateMotoristaStatus, 
  deleteMotorista 
} from '@/lib/supabase/motoristas';
import { toast } from '@/components/ui/use-toast';
import { Motorista, MotoristaFormData } from '../utils/types';

export function useMotoristas() {
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Carrega a lista de motoristas do banco de dados
   */
  const loadMotoristas = useCallback(async () => {
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
  }, []);

  /**
   * Cria um novo motorista
   * @param formData Dados do formulário para criar o motorista
   */
  const handleCreate = useCallback(async (formData: MotoristaFormData) => {
    try {
      const novoMotorista = await createMotorista(formData);
      
      // Atualizar a lista de motoristas
      setMotoristas(prev => [...prev, novoMotorista]);
      
      // Verificar se o motorista tem auth_id para saber se o convite foi enviado
      if (novoMotorista.auth_id) {
        toast({
          title: 'Cadastro realizado com sucesso! 🎉',
          description: `O motorista ${novoMotorista.nome} foi cadastrado com sucesso! \n\nUm convite foi enviado para ${novoMotorista.email} para definição de senha e acesso ao sistema. \n\nO link de convite é válido por 24 horas. Por favor, verifique sua caixa de entrada e spam.`,
          variant: 'default'
        });
      } else {
        toast({
          title: 'Motorista cadastrado com sucesso!',
          description: `O motorista ${novoMotorista.nome} foi adicionado à base de dados com sucesso. Agora você pode gerenciar suas informações e status.`,
          variant: 'default'
        });
      }
      
      return novoMotorista;
    } catch (error) {
      console.error('Erro ao criar novo motorista:', error);
      toast({
        title: 'Erro no cadastro',
        description: error instanceof Error ? error.message : 'Erro ao cadastrar motorista.',
        variant: 'destructive',
      });
      throw error;
    }
  }, []);

  /**
   * Atualiza o status de um motorista
   * @param id ID do motorista
   * @param novoStatus Novo status do motorista ('ativo', 'inativo', etc)
   */
  const handleStatusChange = useCallback(async (id: string, novoStatus: string) => {
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
        description: `Status do motorista alterado para ${novoStatus} com sucesso.`,
        variant: 'default'
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
  }, []);

  /**
   * Exclui um motorista
   * @param id ID do motorista a ser excluído
   */
  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este motorista?')) return;
    
    try {
      await deleteMotorista(id);
      
      // Remover da lista de motoristas
      setMotoristas(prev => prev.filter(motorista => motorista.id !== id));
      
      toast({
        title: 'Sucesso',
        description: 'Motorista excluído com sucesso.',
        variant: 'default'
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
  }, []);

  // Carregar motoristas ao montar o componente
  useEffect(() => {
    loadMotoristas();
  }, [loadMotoristas]);

  return {
    motoristas,
    isLoading,
    loadMotoristas,
    handleCreate,
    handleStatusChange,
    handleDelete
  };
}
