/**
 * Tipos e interfaces para o módulo de Motoristas
 */

// Importando tipos base do Supabase
import { Motorista, MotoristaFormData } from '@/lib/supabase/motoristas';

// Re-exportando os tipos para uso nos componentes
export type { Motorista, MotoristaFormData };

// Tipos adicionais específicos para componentes
export interface MotoristaListProps {
  motoristas: Motorista[];
  isLoading: boolean;
  onStatusChange: (id: string, status: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onViewDetails: (motorista: Motorista) => void;
}

export interface MotoristaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  motorista?: Motorista | null;
}

export interface MotoristaDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  motorista: Motorista | null;
  onStatusChange: (id: string, status: string) => Promise<void>;
}

export interface MotoristaFormProps {
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
  defaultValues?: any;
}

// Tipos para as abas do formulário
export interface FormTabProps {
  form: any;
}
