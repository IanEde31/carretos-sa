'use client';

/**
 * Modal para cadastro e edição de motoristas
 * Engloba o formulário e gerencia a abertura/fechamento do modal
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MotoristaForm } from './MotoristaForm';
import { MotoristaModalProps } from '../utils/types';

export function MotoristaModal({ 
  open, 
  onOpenChange, 
  onSubmit, 
  motorista 
}: MotoristaModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  /**
   * Processa o envio do formulário com tratamento de estado de submissão
   */
  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao processar formulário de motorista:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{motorista ? 'Editar Motorista' : 'Novo Motorista'}</DialogTitle>
          <DialogDescription>
            {motorista 
              ? 'Edite as informações do motorista no formulário abaixo.' 
              : 'Preencha o formulário para cadastrar um novo motorista no sistema.'}
          </DialogDescription>
        </DialogHeader>
        
        <MotoristaForm 
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          defaultValues={motorista}
        />
      </DialogContent>
    </Dialog>
  );
}
