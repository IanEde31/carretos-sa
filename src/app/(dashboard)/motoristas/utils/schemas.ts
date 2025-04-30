/**
 * Esquemas de validação para o módulo de Motoristas
 */

import * as z from 'zod';
import { ACCEPTED_IMAGE_TYPES, ACCEPTED_DOC_TYPES, MAX_FILE_SIZE } from './constants';

/**
 * Schema para validação de formulário de novo motorista
 * Utiliza Zod para validar os dados antes de enviar para a API
 */
export const novoMotoristaSchema = z.object({
  // Informações Pessoais - campos obrigatórios
  nome: z.string().min(3, 'Nome do motorista deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 caracteres'),
  status: z.string().default('ativo'),
  
  // Documentação Pessoal
  cpf: z.string()
    .min(11, 'CPF deve ter 11 dígitos')
    .max(14, 'CPF deve ter no máximo 14 caracteres com formatação')
    .optional()
    .nullable(),
  rg: z.string()
    .min(5, 'RG inválido')
    .max(20, 'RG deve ter no máximo 20 caracteres')
    .optional()
    .nullable(),

  // Informações de Veículo
  veiculo_tipo: z.string().min(1, 'Selecione o tipo de veículo'),
  veiculo_descricao: z.string().min(3, 'Informe a descrição do veículo'),
  placa_veiculo: z.string().min(7, 'Informe a placa do veículo').optional(),
  capacidade_carga: z.coerce.number().min(0, 'A capacidade deve ser positiva').optional(),
  
  // Informações de Atuação
  area_atuacao: z.string().optional(),
  
  // Campos de Endereço
  cep: z.string().min(8, 'CEP inválido').max(9, 'CEP inválido').optional().nullable(),
  rua: z.string().optional().nullable(),
  numero: z.string().optional().nullable(),
  bairro: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  uf: z.string().length(2, 'UF deve ter 2 caracteres').optional().nullable(),
  
  // Campos de arquivo
  foto_perfil: z
    .instanceof(File)
    .refine(file => file.size <= MAX_FILE_SIZE, `Tamanho máximo de 5MB`)
    .refine(
      file => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Formato aceito: .jpg, .jpeg, .png e .webp"
    )
    .optional()
    .nullable(),
  
  doc_cnh: z
    .instanceof(File)
    .refine(file => file.size <= MAX_FILE_SIZE, `Tamanho máximo de 5MB`)
    .refine(
      file => ACCEPTED_DOC_TYPES.includes(file.type),
      "Formato aceito: .pdf, .jpg, .jpeg e .png"
    )
    .optional()
    .nullable(),
    
  doc_identidade_frente: z
    .instanceof(File)
    .refine(file => file.size <= MAX_FILE_SIZE, `Tamanho máximo de 10MB`)
    .refine(
      file => ACCEPTED_DOC_TYPES.includes(file.type),
      "Formato aceito: .pdf, .jpg, .jpeg e .png"
    )
    .optional()
    .nullable(),
    
  doc_identidade_verso: z
    .instanceof(File)
    .refine(file => file.size <= MAX_FILE_SIZE, `Tamanho máximo de 10MB`)
    .refine(
      file => ACCEPTED_DOC_TYPES.includes(file.type),
      "Formato aceito: .pdf, .jpg, .jpeg e .png"
    )
    .optional()
    .nullable(),
    
  doc_veiculo: z
    .instanceof(File)
    .refine(file => file.size <= MAX_FILE_SIZE, `Tamanho máximo de 5MB`)
    .refine(
      file => ACCEPTED_DOC_TYPES.includes(file.type),
      "Formato aceito: .pdf, .jpg, .jpeg e .png"
    )
    .optional()
    .nullable(),
});

// Tipo inferido do schema para uso nos componentes
export type NovoMotoristaValues = z.infer<typeof novoMotoristaSchema>;
