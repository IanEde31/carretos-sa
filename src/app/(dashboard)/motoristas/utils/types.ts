/**
 * Tipos e interfaces para o módulo de motoristas
 */

// Re-exportando tipos do supabase
import { Motorista, MotoristaFormData } from '@/lib/supabase/motoristas';
export type { Motorista, MotoristaFormData };

// Props para componentes
export interface MotoristasListProps {
  motoristas: Motorista[];
  isLoading: boolean;
  onViewDetails: (motorista: Motorista) => void;
  onStatusChange: (id: string, novoStatus: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export interface MotoristaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MotoristaFormData) => Promise<void>;
  defaultMotorista?: Motorista | null;
}

export interface MotoristaDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  motorista: Motorista | null;
  onStatusChange: (id: string, novoStatus: string) => Promise<void>;
}

export interface MotoristaFormProps {
  onSubmit: (data: MotoristaFormData) => Promise<void>;
  defaultMotorista?: Motorista | null;
}

export interface MotoristaFormTabProps {
  form: any; // Tipo do react-hook-form
}

// Tipos para documentos
export interface Documentos {
  cnh?: string;
  identidade?: string;
  documento_veiculo?: string;
}