/**
 * FinalizarCorridaModal.tsx
 * Modal para finalização de uma corrida.
 * Permite registrar o valor, distância, avaliação, fotos e observações da entrega.
 * 
 * Props:
 * - corrida: a corrida a ser finalizada (ou null se não há corrida selecionada)
 * - fotosEntregaPreviews: array de URLs para preview das fotos de entrega
 * - isSubmitting: estado de submissão do formulário
 * - open: estado de abertura do modal
 * - onOpenChange: função para alterar o estado de abertura do modal
 * - onSubmit: função chamada ao submeter o formulário
 * - onFotoChange: função chamada quando as fotos são alteradas
 * 
 * Utiliza shadcn/ui, Tailwind, react-hook-form e zod para validação.
 */

import React from 'react';
import Image from 'next/image';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { Car, User, FileText, ImageIcon, Upload } from 'lucide-react';
import { Corrida } from '@/lib/supabase/corridas';

// Schema para finalizar corrida
const finalizarCorridaSchema = z.object({
  valor: z.string().min(1, 'Informe o valor da corrida'),
  observacoes: z.string().optional(),
  distancia_km: z.string().optional(),
  avaliacao: z.string().optional(),
  feedback: z.string().optional(),
  fotos_entrega: z
    .any()
    .optional()
    .refine(
      (files) => {
        // Verificar se estamos no ambiente do cliente
        if (typeof window === 'undefined') return true;
        
        // Se não tiver arquivos, tudo bem (é opcional)
        if (!files) return true;

        // Verificar se é uma instância de FileList (lado do cliente)
        const fileList = files as FileList;
        return fileList instanceof FileList;
      },
      "É necessário enviar arquivos válidos"
    )
    .refine(
      (files) => {
        // Verificar se estamos no ambiente do cliente
        if (typeof window === 'undefined') return true;
        
        // Se não tiver arquivos, tudo bem (é opcional)
        if (!files) return true;

        // Verifica o número de arquivos
        const fileList = files as FileList;
        return fileList.length <= 5;
      },
      "Máximo de 5 fotos permitidas!"
    )
    .refine(
      (files) => {
        // Verificar se estamos no ambiente do cliente
        if (typeof window === 'undefined') return true;
        
        // Se não tiver arquivos, tudo bem (é opcional)
        if (!files) return true;

        // Verifica o tamanho dos arquivos
        const fileList = files as FileList;
        return Array.from(fileList).every((file) => file.size <= 5 * 1024 * 1024);
      },
      `Tamanho máximo de arquivo é 5MB`
    )
    .refine(
      (files) => {
        // Verificar se estamos no ambiente do cliente
        if (typeof window === 'undefined') return true;
        
        // Se não tiver arquivos, tudo bem (é opcional)
        if (!files) return true;

        // Verifica o tipo dos arquivos
        const fileList = files as FileList;
        return Array.from(fileList).every((file) => 
          ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)
        );
      },
      'Formatos suportados: .jpg, .jpeg, .png e .webp'
    )
    .transform((files) => (files && files.length > 0 ? Array.from(files) : undefined)),
});

type FinalizarCorridaValues = z.infer<typeof finalizarCorridaSchema>;

interface FinalizarCorridaModalProps {
  corrida: Corrida | null;
  fotosEntregaPreviews: string[];
  isSubmitting: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FinalizarCorridaValues) => void;
  onFotoChange: (files: FileList | null) => void;
}

const FinalizarCorridaModal: React.FC<FinalizarCorridaModalProps> = ({
  corrida,
  fotosEntregaPreviews,
  isSubmitting,
  open,
  onOpenChange,
  onSubmit,
  onFotoChange,
}) => {
  // Configuração do formulário
  const form = useForm<FinalizarCorridaValues>({
    resolver: zodResolver(finalizarCorridaSchema),
    defaultValues: {
      valor: '',
      observacoes: '',
      distancia_km: '',
      avaliacao: '5',
      feedback: '',
    },
  });

  // Função para lidar com a submissão do formulário
  const handleSubmit = (data: FinalizarCorridaValues) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Finalizar Corrida</DialogTitle>
          <DialogDescription>
            Registre os detalhes da finalização da corrida
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <ScrollArea className="h-[60vh]">
              <Tabs defaultValue="detalhes" className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="detalhes" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Detalhes
                  </TabsTrigger>
                  <TabsTrigger value="fotos" className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Fotos de Entrega
                  </TabsTrigger>
                </TabsList>
                
                {/* Tab: Detalhes da Finalização */}
                <TabsContent value="detalhes" className="space-y-4 pt-2">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="bg-muted p-4 rounded-lg mb-2">
                          <h3 className="font-medium text-sm mb-2">Informações da Corrida</h3>
                          <div className="grid grid-cols-1 gap-2 text-sm">
                            <div className="flex items-start gap-2">
                              <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                              <span className="text-muted-foreground">Cliente:</span>
                              <span className="font-medium">{corrida?.solicitacao?.cliente_nome}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Car className="h-4 w-4 mt-0.5 text-muted-foreground" />
                              <span className="text-muted-foreground">Motorista:</span>
                              <span className="font-medium">{corrida?.motorista_nome}</span>
                            </div>
                          </div>
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="valor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">Valor da Corrida (R$)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  step="0.01"
                                  min="0"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="distancia_km"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">Distância Percorrida (km)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0.0"
                                  step="0.1"
                                  min="0"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="avaliacao"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">Avaliação (1-5)</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione a avaliação" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">⭐ (1) Péssimo</SelectItem>
                                  <SelectItem value="2">⭐⭐ (2) Ruim</SelectItem>
                                  <SelectItem value="3">⭐⭐⭐ (3) Regular</SelectItem>
                                  <SelectItem value="4">⭐⭐⭐⭐ (4) Bom</SelectItem>
                                  <SelectItem value="5">⭐⭐⭐⭐⭐ (5) Excelente</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="feedback"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">Feedback do Cliente</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Comentários ou feedback do cliente"
                                  className="min-h-[80px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="observacoes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">Observações</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Observações adicionais sobre a finalização"
                                  className="min-h-[80px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Tab: Fotos de Entrega */}
                <TabsContent value="fotos" className="space-y-4 pt-2">
                  <Card>
                    <CardContent className="pt-6">
                      <FormField
                        control={form.control}
                        name="fotos_entrega"
                        render={({ field: { onChange, ...fieldProps } }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <ImageIcon className="w-4 h-4" />
                              Fotos da Entrega
                            </FormLabel>
                            <FormControl>
                              <div className="grid gap-4">
                                <div className="flex items-center justify-center w-full">
                                  <Label
                                    htmlFor="fotos_entrega_upload"
                                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                                  >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                      <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="font-semibold">Clique para escolher</span> ou arraste as imagens
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Formatos: JPG, PNG (Máx: 5MB por arquivo)
                                      </p>
                                    </div>
                                    <Input
                                      id="fotos_entrega_upload"
                                      type="file"
                                      multiple
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        onChange(e.target.files);
                                        onFotoChange(e.target.files);
                                      }}
                                      name={fieldProps.name}
                                      ref={fieldProps.ref}
                                      onBlur={fieldProps.onBlur}
                                    />
                                  </Label>
                                </div>
                                
                                {/* Mostrar previews de imagens */}
                                {fotosEntregaPreviews.length > 0 && (
                                  <div className="grid grid-cols-3 gap-2 mt-2">
                                    {fotosEntregaPreviews.map((url, i) => (
                                      <div key={i} className="relative aspect-square rounded-md overflow-hidden">
                                        <Image 
                                          src={url} 
                                          alt={`Foto de entrega ${i+1}`}
                                          fill
                                          className="object-cover"
                                          sizes="(max-width: 768px) 100px, 150px"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <FormDescription>
                              Adicione fotos da entrega para comprovar a finalização
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </ScrollArea>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Finalizando..." : "Finalizar Corrida"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default FinalizarCorridaModal;
