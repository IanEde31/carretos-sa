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
      // Informações Pessoais
      nome: defaultMotorista?.nome || '',
      email: defaultMotorista?.email || '',
      telefone: defaultMotorista?.telefone || '',
      status: defaultMotorista?.status || 'ativo',
      cpf: defaultMotorista?.cpf || '',
      rg: defaultMotorista?.rg || '',
      
      // Veículo
      veiculo_tipo: defaultMotorista?.veiculo?.tipo || '',
      veiculo_descricao: defaultMotorista?.veiculo?.descricao || '',
      placa_veiculo: defaultMotorista?.placa_veiculo || '',
      capacidade_carga: defaultMotorista?.capacidade_carga || 0,
      
      // Área de Atuação
      area_atuacao: defaultMotorista?.area_atuacao || '',
      
      // Endereço
      cep: defaultMotorista?.cep || '',
      rua: defaultMotorista?.rua || '',
      numero: defaultMotorista?.numero || '',
      bairro: defaultMotorista?.bairro || '',
      cidade: defaultMotorista?.cidade || '',
      uf: defaultMotorista?.uf || '',
      
      // Arquivos
      foto_perfil: undefined,
      doc_cnh: undefined,
      doc_identidade_frente: undefined,
      doc_identidade_verso: undefined,
      doc_veiculo: undefined,
    },
  });

  /**
   * Processa o envio do formulário
   */
  const handleSubmit = async (data: NovoMotoristaValues) => {
    setIsSubmitting(true);
    
    try {
      // Preparar os dados para envio - converte valores null para undefined
      const formData: MotoristaFormData = {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        status: data.status,
        veiculo_tipo: data.veiculo_tipo,
        veiculo_descricao: data.veiculo_descricao,
        
        // Documentação pessoal - converter null para undefined
        cpf: data.cpf || undefined,
        rg: data.rg || undefined,
        
        // Campos do veículo
        placa_veiculo: data.placa_veiculo || undefined,
        capacidade_carga: data.capacidade_carga,
        area_atuacao: data.area_atuacao || undefined,
        
        // Endereço - converter null para undefined
        cep: data.cep || undefined,
        rua: data.rua || undefined,
        numero: data.numero || undefined,
        bairro: data.bairro || undefined,
        cidade: data.cidade || undefined,
        uf: data.uf || undefined,
        
        // Arquivos - garantir que sejam File ou undefined (não null)
        doc_cnh: data.doc_cnh || undefined,
        doc_identidade_frente: data.doc_identidade_frente || undefined,
        doc_identidade_verso: data.doc_identidade_verso || undefined,
        doc_veiculo: data.doc_veiculo || undefined,
        foto_perfil: data.foto_perfil || undefined
      };
      
      // Chamar a função de envio fornecida pelo componente pai
      await onSubmit(formData);
      
      // Resetar o formulário após o envio bem-sucedido
      form.reset();
    } catch (error) {
      // Erros são tratados no hook useMotoristas ou no componente que utiliza este hook
      console.error('Erro no envio do formulário de motorista:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    handleSubmit: form.handleSubmit(handleSubmit),
  };
}
