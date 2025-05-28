/**
 * CargaTab.tsx
 * Aba de informações da carga para o formulário de nova corrida.
 * Contém os campos de descrição, dimensões, peso, valor e fotos da carga.
 */

import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Package,
  FileText,
  Truck,
  Upload,
  CalendarIcon,
  Clock,
  Banknote,
  ArrowLeft,
  Scale,
  Ruler,
  Hash,
  FileEdit,
  Image as ImageIcon
} from 'lucide-react';
import { NovaCorrridaValues } from './NovaCorridaModal';

interface CargaTabProps {
  form: UseFormReturn<NovaCorrridaValues>;
  onAnteriorClick: () => void;
  tiposVeiculos: {id: string, nome: string}[];
  fotosCargaPreviews: string[];
  isSubmitting: boolean;
}

const CargaTab: React.FC<CargaTabProps> = ({ 
  form, 
  onAnteriorClick, 
  tiposVeiculos, 
  fotosCargaPreviews,
  isSubmitting
}) => {
  const [date, setDate] = useState<Date | undefined>(undefined);

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Detalhes da Carga */}
      <Card className="border-l-4 border-l-amber-500">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5 text-amber-500" />
              Informações da Carga
            </CardTitle>
            <Badge variant="outline" className="text-xs font-normal">Etapa 3 de 3</Badge>
          </div>
          <CardDescription>Descreva detalhes sobre a carga a ser transportada</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-2">
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Descrição da Carga *
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva os itens que serão transportados, quantidade, peso aproximado, tipo de embalagem, etc." 
                      className="min-h-[100px] focus:border-amber-500" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dimensoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Ruler className="w-4 h-4" />
                    Dimensões
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: 2x1x1m, 100x50x30cm" 
                      {...field} 
                      className="focus:border-amber-500" 
                    />
                  </FormControl>
                  <FormDescription>
                    Largura x Altura x Comprimento (aproximado)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="peso_aproximado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    Peso Aproximado
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: 50kg, 200kg, 1 tonelada" 
                      {...field} 
                      className="focus:border-amber-500" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantidade_itens"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Quantidade de Itens
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Número de volumes" 
                      {...field} 
                      className="focus:border-amber-500" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tipo_veiculo_requerido"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Tipo de Veículo Necessário *
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="focus:ring-amber-500">
                        <SelectValue placeholder="Selecione o tipo de veículo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tiposVeiculos.map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id} className="cursor-pointer">
                          {tipo.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Selecione o tipo de veículo mais adequado para a carga
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Banknote className="w-4 h-4" />
                    Valor Estimado (R$)
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                      <Input 
                        placeholder="0,00" 
                        className="pl-10 focus:border-amber-500" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Valor proposto para a corrida (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Informações de Data e Observações */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-orange-500" />
            Agendamento e Observações
          </CardTitle>
          <CardDescription>Informações adicionais para o serviço</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="data_retirada"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Data de Retirada
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={value ? (value instanceof Date ? value.toISOString().split('T')[0] : value) : ''}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value) : undefined;
                        onChange(date);
                        setDate(date);
                      }}
                      className="focus:border-orange-500"
                    />
                  </FormControl>
                  <FormDescription>
                    Data preferencial para a coleta (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="horario_retirada"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Horário Preferencial
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Entre 9h e 12h, A partir das 14h" 
                      {...field} 
                      className="focus:border-orange-500" 
                    />
                  </FormControl>
                  <FormDescription>
                    Período do dia para a coleta (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Número de Ajudantes */}
            <FormField
              control={form.control}
              name="numero_ajudantes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Número de Ajudantes
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Permite apenas dígitos ou string vazia para o placeholder funcionar e default do Zod
                        if (/^\d*$/.test(value)) {
                          field.onChange(value);
                        }
                      }}
                      className="focus:border-amber-500" 
                    />
                  </FormControl>
                  <FormDescription>
                    Custo adicional de R$ 100,00 por ajudante.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Exibição do Custo Adicional com Ajudantes */}
            {/* form.watch('numero_ajudantes') agora é number devido ao z.preprocess */}
            {(form.watch('numero_ajudantes') || 0) > 0 && (
              <div className="md:col-span-1 mt-0 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-center">
                <p className="text-sm text-amber-700">
                  Custo adicional com ajudantes: 
                  <span className="font-semibold">
                    {` R$ ${((form.watch('numero_ajudantes') || 0) * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </span>
                </p>
              </div>
            )}

            {/* O TargetContent original vem aqui para que a inserção seja ANTES dele */}
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-2">
                  <FormLabel className="flex items-center gap-2">
                    <FileEdit className="w-4 h-4" />
                    Observações Adicionais
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Informações adicionais importantes para a corrida" 
                      className="min-h-[80px] focus:border-orange-500" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Instruções especiais, cuidados com a carga, etc. (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Upload de Fotos */}
      <Card className="border-l-4 border-l-sky-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-sky-500" />
            Fotos da Carga
          </CardTitle>
          <CardDescription>Adicione fotos para melhor visualização do que será transportado</CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="fotos_carga"
            render={({ field: { onChange, ...fieldProps } }) => (
              <FormItem>
                <FormControl>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-center w-full">
                      <Label
                        htmlFor="fotos_upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors duration-200"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Clique para escolher</span> ou arraste as imagens
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Formatos aceitos: JPG, PNG, WebP (Máx: 5MB por arquivo)
                          </p>
                        </div>
                        <Input
                          id="fotos_upload"
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            onChange(e.target.files);
                          }}
                          name={fieldProps.name}
                          ref={fieldProps.ref}
                          onBlur={fieldProps.onBlur}
                        />
                      </Label>
                    </div>
                    
                    {/* Mostrar previews de imagens */}
                    {fotosCargaPreviews.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
                        {fotosCargaPreviews.map((url, i) => (
                          <div key={i} className="relative aspect-square rounded-md overflow-hidden border border-sky-300 shadow-sm">
                            <Image 
                              src={url} 
                              alt={`Foto de carga ${i+1}`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100px, 150px"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs py-1 px-2">
                              Foto {i+1}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormDescription>
                  Adicione até 5 fotos da carga para melhor visualização (opcional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
      
      {/* Botões de navegação */}
      <div className="flex justify-between">
        <Button
          type="button"
          onClick={onAnteriorClick}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Endereços
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-5 py-2.5"
        >
          {isSubmitting ? "Cadastrando..." : "Finalizar e Cadastrar Corrida"}
        </Button>
      </div>
    </div>
  );
};

export default CargaTab;
