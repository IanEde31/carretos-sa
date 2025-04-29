/**
 * Schemas de validação para o módulo de motoristas
 */

import * as z from 'zod';
import { ACCEPTED_DOC_TYPES, ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from './constants';

// Schema para validação de formulário de novo motorista
export const novoMotoristaSchema = z.object({
  nome: z.string().min(3, 'Nome do motorista deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 caracteres'),
  veiculo_tipo: z.string().min(1, 'Selecione o tipo de veículo'),
  veiculo_descricao: z.string().min(3, 'Informe a descrição do veículo'),
  status: z.string().default('ativo'),
  
  // Campos opcionais
  placa_veiculo: z.string().min(7, 'Informe a placa do veículo').optional(),
  capacidade_carga: z.coerce.number().min(0, 'A capacidade deve ser positiva').optional(),
  area_atuacao: z.string().optional(),
  
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
    
  doc_identidade: z
    .instanceof(File)
    .refine(file => file.size <= MAX_FILE_SIZE, `Tamanho máximo de 5MB`)
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

// Tipo inferido do schema
export type NovoMotoristaValues = z.infer<typeof novoMotoristaSchema>;