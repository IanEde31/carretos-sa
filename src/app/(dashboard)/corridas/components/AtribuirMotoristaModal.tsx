/**
 * AtribuirMotoristaModal.tsx
 * Modal para atribuição de motorista a uma corrida.
 * Permite selecionar um motorista da lista para atribuir à corrida selecionada.
 * 
 * Props:
 * - corrida: a corrida a ser atribuída (ou null se não há corrida selecionada)
 * - motoristas: lista de motoristas disponíveis para atribuição
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Car, User, MapPin } from 'lucide-react';
import { Corrida } from '@/lib/supabase/corridas';

// Schema para atribuir motorista
const atribuirMotoristaSchema = z.object({
  motorista_id: z.string().min(1, 'Selecione um motorista'),
});

type AtribuirMotoristaValues = z.infer<typeof atribuirMotoristaSchema>;

interface AtribuirMotoristaModalProps {
  corrida: Corrida | null;
  motoristas: { id: string; nome: string }[];
  isSubmitting: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AtribuirMotoristaValues) => void;
}

const AtribuirMotoristaModal: React.FC<AtribuirMotoristaModalProps> = ({
  corrida,
  motoristas,
  isSubmitting,
  open,
  onOpenChange,
  onSubmit,
}) => {
  // Configuração do formulário
  const form = useForm<AtribuirMotoristaValues>({
    resolver: zodResolver(atribuirMotoristaSchema),
    defaultValues: {
      motorista_id: '',
    },
  });

  // Função para lidar com a submissão do formulário
  const handleSubmit = (data: AtribuirMotoristaValues) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Atribuir Motorista</DialogTitle>
          <DialogDescription>
            Selecione um motorista para realizar esta corrida
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium text-sm mb-2">Detalhes da Corrida</h3>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Cliente:</span>
                        <span className="font-medium">{corrida?.solicitacao?.cliente_nome}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Origem:</span>
                        <span className="font-medium">{corrida?.solicitacao?.endereco_origem}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Destino:</span>
                        <span className="font-medium">{corrida?.solicitacao?.endereco_destino}</span>
                      </div>
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="motorista_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Car className="w-4 h-4" />
                          Motorista
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um motorista" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {motoristas.map((motorista) => (
                              <SelectItem key={motorista.id} value={motorista.id}>
                                {motorista.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          O motorista selecionado receberá uma notificação sobre esta corrida
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
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Atribuindo..." : "Atribuir Motorista"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AtribuirMotoristaModal;
