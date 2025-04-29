/**
 * Hook personalizado para gerenciar o formulário de motoristas
 * Encapsula a lógica de validação e envio do formulário
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { novoMotoristaSchema, NovoMotoristaValues } from '../utils/schemas';
import { Motorista, MotoristaFormData } from '../utils/types';

export function useMotoristaForm(
  onSubmit: (data: MotoristaFormData) => Promise<void>,
  defaultMotorista?: Motorista | null
) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializar o formulário com react-hook-form e zod
  const form = useForm<NovoMotoristaValues>({
    resolver: zodResolver(novoMotoristaSchema),
    defaultValues: {
      nome: defaultMotorista?.nome || '',
      email: defaultMotorista?.email || '',
      telefone: defaultMotorista?.telefone || '',
      veiculo_tipo: defaultMotorista?.veiculo?.tipo || '',
      veiculo_descricao: defaultMotorista?.veiculo?.descricao || '',
      status: defaultMotorista?.status || 'ativo',
      placa_veiculo: defaultMotorista?.placa_veiculo || '',
      capacidade_carga: defaultMotorista?.capacidade_carga || 0,
      area_atuacao: defaultMotorista?.area_atuacao || '',
      foto_perfil: undefined,
      doc_cnh: undefined,
      doc_identidade: undefined,
      doc_veiculo: undefined,
    },
  });

  // Função para lidar com o envio do formulário
  const handleSubmit = async (data: NovoMotoristaValues) => {
    setIsSubmitting(true);
    
    try {
      // Converter dados do formulário para o formato esperado pela API
      const formData: MotoristaFormData = {
        ...data,
        doc_cnh: data.doc_cnh || undefined,
        doc_identidade: data.doc_identidade || undefined,
        doc_veiculo: data.doc_veiculo || undefined,
        foto_perfil: data.foto_perfil || undefined
      };
      
      // Chamar a função de submissão passada como prop
      await onSubmit(formData);
      
      // Resetar o formulário após sucesso
      form.reset();
    } catch (error) {
      console.error('Erro ao processar formulário:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    handleSubmit: form.handleSubmit(handleSubmit)
  };
}