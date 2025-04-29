/**
 * CancelarCorridaModal.tsx
 * Modal para cancelamento de uma corrida.
 * Permite informar o motivo do cancelamento de uma corrida.
 * 
 * Props:
 * - corrida: a corrida a ser cancelada (ou null se não há corrida selecionada)
 * - isSubmitting: estado de submissão do formulário
 * - open: estado de abertura do modal
 * - onOpenChange: função para alterar o estado de abertura do modal
 * - onSubmit: função chamada ao submeter o formulário
 * 
 * Utiliza shadcn/ui, Tailwind, react-hook-form e zod para validação.
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Car, User, MapPin, XCircle } from 'lucide-react';
import { Corrida } from '@/lib/supabase/corridas';

// Schema para cancelar corrida
const cancelarCorridaSchema = z.object({
  motivo: z.string().min(3, 'Informe o motivo do cancelamento'),
});

type CancelarCorridaValues = z.infer<typeof cancelarCorridaSchema>;

interface CancelarCorridaModalProps {
  corrida: Corrida | null;
  isSubmitting: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CancelarCorridaValues) => void;
}

const CancelarCorridaModal: React.FC<CancelarCorridaModalProps> = ({
  corrida,
  isSubmitting,
  open,
  onOpenChange,
  onSubmit,
}) => {
  // Configuração do formulário
  const form = useForm<CancelarCorridaValues>({
    resolver: zodResolver(cancelarCorridaSchema),
    defaultValues: {
      motivo: '',
    },
  });

  // Função para lidar com a submissão do formulário
  const handleSubmit = (data: CancelarCorridaValues) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cancelar Corrida</DialogTitle>
          <DialogDescription>
            Informe o motivo do cancelamento da corrida
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium text-sm mb-2">Informações da Corrida</h3>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Cliente:</span>
                        <span className="font-medium">{corrida?.solicitacao?.cliente_nome}</span>
                      </div>
                      {corrida?.motorista_nome && (
                        <div className="flex items-start gap-2">
                          <Car className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <span className="text-muted-foreground">Motorista:</span>
                          <span className="font-medium">{corrida?.motorista_nome}</span>
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Origem:</span>
                        <span className="font-medium">{corrida?.solicitacao?.endereco_origem}</span>
                      </div>
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="motivo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <XCircle className="w-4 h-4" />
                          Motivo do Cancelamento
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva o motivo do cancelamento"
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Este motivo será registrado no histórico da corrida
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Voltar
              </Button>
              <Button type="submit" variant="destructive" disabled={isSubmitting}>
                {isSubmitting ? "Cancelando..." : "Confirmar Cancelamento"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CancelarCorridaModal;
