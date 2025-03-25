'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Upload,
  X,
  Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  createMotorista, 
  getMotoristas, 
  updateMotoristaStatus, 
  deleteMotorista, 
  type Motorista,
  type MotoristaFormData
} from '@/lib/supabase/motoristas';
import { toast } from '@/components/ui/use-toast';
import Image from 'next/image';

// Tipos de arquivo aceitos para uploads
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ACCEPTED_DOC_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Schema para validação de formulário de novo motorista
const novoMotoristaSchema = z.object({
  nome: z.string().min(3, 'Nome do motorista deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 caracteres'),
  veiculo_tipo: z.string().min(1, 'Selecione o tipo de veículo'),
  veiculo_descricao: z.string().min(3, 'Informe a descrição do veículo'),
  status: z.string().default('ativo'),
  
  // Novos campos
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

type NovoMotoristaValues = z.infer<typeof novoMotoristaSchema>;

export default function MotoristasPage() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Carregar motoristas da API
  useEffect(() => {
    async function loadMotoristas() {
      try {
        setIsLoading(true);
        const data = await getMotoristas();
        setMotoristas(data);
      } catch (error) {
        console.error('Erro ao carregar motoristas:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar a lista de motoristas.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadMotoristas();
  }, []);

  const form = useForm<NovoMotoristaValues>({
    resolver: zodResolver(novoMotoristaSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      veiculo_tipo: '',
      veiculo_descricao: '',
      status: 'ativo',
      placa_veiculo: '',
      capacidade_carga: 0,
      area_atuacao: '',
      foto_perfil: undefined,
      doc_cnh: undefined,
      doc_identidade: undefined,
      doc_veiculo: undefined,
    },
  });

  // Função para lidar com o envio do formulário
  async function onSubmit(data: NovoMotoristaValues) {
    setIsSubmitting(true);
    
    try {
      // Enviar dados para a API
      const formData: MotoristaFormData = {
        ...data,
        doc_cnh: data.doc_cnh || undefined,
        doc_identidade: data.doc_identidade || undefined,
        doc_veiculo: data.doc_veiculo || undefined,
        foto_perfil: data.foto_perfil || undefined
      };
      const novoMotorista = await createMotorista(formData);
      
      // Atualizar a lista de motoristas
      setMotoristas(prev => [...prev, novoMotorista]);
      
      toast({
        title: 'Sucesso',
        description: 'Motorista cadastrado com sucesso!',
        variant: 'default',
      });
      
      // Resetar o formulário e fechar o modal
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Erro ao criar novo motorista:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao cadastrar motorista.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  // Função para alterar o status de um motorista
  async function handleStatusChange(id: string, novoStatus: string) {
    try {
      await updateMotoristaStatus(id, novoStatus);
      
      // Atualizar a lista de motoristas
      setMotoristas(prev => 
        prev.map(motorista => 
          motorista.id === id ? {...motorista, status: novoStatus} : motorista
        )
      );
      
      toast({
        title: 'Sucesso',
        description: `Status do motorista alterado para ${novoStatus}.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Erro ao atualizar status do motorista:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status do motorista.',
        variant: 'destructive',
      });
    }
  }
  
  // Função para excluir um motorista
  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este motorista?')) return;
    
    try {
      await deleteMotorista(id);
      
      // Remover da lista de motoristas
      setMotoristas(prev => prev.filter(motorista => motorista.id !== id));
      
      toast({
        title: 'Sucesso',
        description: 'Motorista excluído com sucesso.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Erro ao excluir motorista:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o motorista.',
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Motoristas</h1>
            <p className="text-muted-foreground">
              Gerencie os motoristas cadastrados no sistema
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Novo Motorista</span>
                <span className="sm:hidden">Novo</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Motorista</DialogTitle>
                <DialogDescription>
                  Cadastre um novo motorista no sistema
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <Tabs defaultValue="informacoes" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="informacoes">Informações Pessoais</TabsTrigger>
                      <TabsTrigger value="veiculo">Veículo</TabsTrigger>
                      <TabsTrigger value="documentos">Documentos</TabsTrigger>
                    </TabsList>
                    
                    {/* Tab de Informações Pessoais */}
                    <TabsContent value="informacoes" className="mt-4">
                      <Card>
                        <CardContent className="pt-6 space-y-4">
                          <div className="flex flex-col items-center justify-center mb-4">
                            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-muted flex items-center justify-center mb-2 border-2 border-dashed border-muted-foreground/25">
                              {form.watch('foto_perfil') ? (
                                <Image
                                  src={URL.createObjectURL(form.watch('foto_perfil') as Blob)}
                                  alt="Foto de perfil"
                                  className="object-cover rounded-full"
                                  fill
                                  sizes="128px"
                                />
                              ) : (
                                <Camera className="h-12 w-12 text-muted-foreground/70" />
                              )}
                              {form.watch('foto_perfil') && (
                                <Button 
                                  variant="destructive" 
                                  size="icon" 
                                  className="absolute top-1 right-1 h-6 w-6 rounded-full"
                                  type="button"
                                  onClick={() => form.setValue('foto_perfil', null)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            <FormField
                              control={form.control}
                              name="foto_perfil"
                              render={({ field: { onChange, value, ...rest } }) => (
                                <FormItem className="text-center">
                                  <FormLabel className="cursor-pointer text-primary">
                                    Carregar foto de perfil
                                    <Input
                                      type="file"
                                      accept={ACCEPTED_IMAGE_TYPES.join(', ')}
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) onChange(file);
                                      }}
                                      {...rest}
                                    />
                                  </FormLabel>
                                  <FormMessage />
                                  <FormDescription>
                                    Foto JPG, PNG ou WEBP (máx. 5MB)
                                  </FormDescription>
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="nome"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nome</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Nome completo" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input placeholder="email@exemplo.com" type="email" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="telefone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Telefone</FormLabel>
                                  <FormControl>
                                    <Input placeholder="(00) 00000-0000" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="area_atuacao"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Área de Atuação</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Ex: São Paulo, Zona Sul" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                  <FormDescription>
                                    Região onde o motorista trabalha
                                  </FormDescription>
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione o status" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="ativo">Ativo</SelectItem>
                                    <SelectItem value="inativo">Inativo</SelectItem>
                                    <SelectItem value="ferias">Em férias</SelectItem>
                                    <SelectItem value="suspenso">Suspenso</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* Tab de Veículo */}
                    <TabsContent value="veiculo" className="mt-4">
                      <Card>
                        <CardContent className="pt-6 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="veiculo_tipo"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tipo de Veículo</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione o tipo de veículo" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="carro">Carro</SelectItem>
                                      <SelectItem value="moto">Moto</SelectItem>
                                      <SelectItem value="van">Van</SelectItem>
                                      <SelectItem value="caminhao_pequeno">Caminhão Pequeno (3/4)</SelectItem>
                                      <SelectItem value="caminhao_medio">Caminhão Médio (Toco)</SelectItem>
                                      <SelectItem value="caminhao_grande">Caminhão Grande (Truck)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="placa_veiculo"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Placa do Veículo</FormLabel>
                                  <FormControl>
                                    <Input placeholder="ABC1D23" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name="veiculo_descricao"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Descrição do Veículo</FormLabel>
                                <FormControl>
                                  <Input placeholder="Marca, modelo, ano, cor" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="capacidade_carga"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Capacidade de Carga (kg)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Informe a capacidade em kg" type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                                <FormDescription>
                                  Capacidade máxima de carga do veículo em kg
                                </FormDescription>
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* Tab de Documentos */}
                    <TabsContent value="documentos" className="mt-4">
                      <Card>
                        <CardContent className="pt-6 space-y-6">
                          <div className="space-y-1">
                            <h3 className="font-medium">Documentação do Motorista</h3>
                            <p className="text-sm text-muted-foreground">
                              Faça upload dos documentos necessários (PDF ou imagens até 5MB)
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* CNH */}
                            <div className="space-y-2">
                              <FormField
                                control={form.control}
                                name="doc_cnh"
                                render={({ field: { onChange, value, ...rest } }) => (
                                  <FormItem>
                                    <FormLabel>Carteira Nacional de Habilitação (CNH)</FormLabel>
                                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-muted-foreground/50 transition-colors">
                                      {value ? (
                                        <div className="flex flex-col items-center">
                                          <div className="bg-muted p-2 rounded flex items-center justify-center">
                                            {value.type.includes('image') ? (
                                              <div className="relative w-full">
                                                <Image
                                                  src={URL.createObjectURL(value as Blob)}
                                                  alt="CNH do motorista"
                                                  className="object-cover"
                                                  fill
                                                  sizes="(max-width: 768px) 100vw, 300px"
                                                />
                                              </div>
                                            ) : (
                                              <div className="relative">
                                                <div className="flex flex-col items-center p-4">
                                                  <p className="text-xs text-muted-foreground mt-2">{value.name}</p>
                                                  <p className="text-xs text-muted-foreground">{(value.size / 1024 / 1024).toFixed(2)}MB</p>
                                                </div>
                                                <Button
                                                  variant="destructive"
                                                  size="icon"
                                                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                                  type="button"
                                                  onClick={() => form.setValue('doc_cnh', null)}
                                                >
                                                  <X className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ) : (
                                        <Label htmlFor="doc_cnh" className="flex flex-col items-center gap-2 cursor-pointer">
                                          <Upload className="h-10 w-10 text-muted-foreground/70" />
                                          <p className="text-sm text-muted-foreground">Clique para fazer upload da CNH</p>
                                        </Label>
                                      )}
                                      <Input
                                        id="doc_cnh"
                                        type="file"
                                        accept={ACCEPTED_DOC_TYPES.join(', ')}
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) onChange(file);
                                        }}
                                        {...rest}
                                      />
                                    </div>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            {/* RG/Identidade */}
                            <div className="space-y-2">
                              <FormField
                                control={form.control}
                                name="doc_identidade"
                                render={({ field: { onChange, value, ...rest } }) => (
                                  <FormItem>
                                    <FormLabel>Documento de Identidade (RG)</FormLabel>
                                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-muted-foreground/50 transition-colors">
                                      {value ? (
                                        <div className="flex flex-col items-center">
                                          <div className="bg-muted p-2 rounded flex items-center justify-center">
                                            {value.type.includes('image') ? (
                                              <div className="relative w-full">
                                                <Image
                                                  src={URL.createObjectURL(value as Blob)}
                                                  alt="Documento de identidade"
                                                  className="object-cover"
                                                  fill
                                                  sizes="(max-width: 768px) 100vw, 300px"
                                                />
                                              </div>
                                            ) : (
                                              <div className="relative">
                                                <div className="flex flex-col items-center p-4">
                                                  <p className="text-xs text-muted-foreground mt-2">{value.name}</p>
                                                  <p className="text-xs text-muted-foreground">{(value.size / 1024 / 1024).toFixed(2)}MB</p>
                                                </div>
                                                <Button
                                                  variant="destructive"
                                                  size="icon"
                                                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                                  type="button"
                                                  onClick={() => form.setValue('doc_identidade', null)}
                                                >
                                                  <X className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ) : (
                                        <Label htmlFor="doc_identidade" className="flex flex-col items-center gap-2 cursor-pointer">
                                          <Upload className="h-10 w-10 text-muted-foreground/70" />
                                          <p className="text-sm text-muted-foreground">Clique para fazer upload do RG</p>
                                        </Label>
                                      )}
                                      <Input
                                        id="doc_identidade"
                                        type="file"
                                        accept={ACCEPTED_DOC_TYPES.join(', ')}
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) onChange(file);
                                        }}
                                        {...rest}
                                      />
                                    </div>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                          
                          {/* Documento do Veículo */}
                          <div className="space-y-2">
                            <FormField
                              control={form.control}
                              name="doc_veiculo"
                              render={({ field: { onChange, value, ...rest } }) => (
                                <FormItem>
                                  <FormLabel>Documento do Veículo (CRLV)</FormLabel>
                                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-muted-foreground/50 transition-colors">
                                    {value ? (
                                      <div className="flex flex-col items-center">
                                        <div className="bg-muted p-2 rounded flex items-center justify-center">
                                          {value.type.includes('image') ? (
                                            <div className="relative w-full">
                                              <Image
                                                src={URL.createObjectURL(value as Blob)}
                                                alt="Documento do veículo"
                                                className="object-cover"
                                                fill
                                                sizes="(max-width: 768px) 100vw, 300px"
                                              />
                                            </div>
                                          ) : (
                                            <div className="relative">
                                              <div className="flex flex-col items-center p-4">
                                                <p className="text-xs text-muted-foreground mt-2">{value.name}</p>
                                                <p className="text-xs text-muted-foreground">{(value.size / 1024 / 1024).toFixed(2)}MB</p>
                                              </div>
                                              <Button
                                                variant="destructive"
                                                size="icon"
                                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                                type="button"
                                                onClick={() => form.setValue('doc_veiculo', null)}
                                              >
                                                <X className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <Label htmlFor="doc_veiculo" className="flex flex-col items-center gap-2 cursor-pointer">
                                        <Upload className="h-10 w-10 text-muted-foreground/70" />
                                        <p className="text-sm text-muted-foreground">Clique para fazer upload do documento do veículo</p>
                                      </Label>
                                    )}
                                    <Input
                                      id="doc_veiculo"
                                      type="file"
                                      accept={ACCEPTED_DOC_TYPES.join(', ')}
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) onChange(file);
                                      }}
                                      {...rest}
                                    />
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>

                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Cadastrando...' : 'Cadastrar Motorista'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar motoristas..."
              className="pl-8 w-full"
            />
          </div>
          <Button variant="outline" size="icon" className="w-full sm:w-auto">
            <Filter className="h-4 w-4 mr-2" />
            <span className="sm:hidden">Filtrar</span>
          </Button>
        </div>

        {/* Tabela para desktop */}
        <div className="border rounded-md hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Cadastro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : motoristas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Nenhum motorista encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                motoristas.map(motorista => (
                  <TableRow key={motorista.id}>
                    <TableCell>{motorista.id?.substring(0, 8)}</TableCell>
                    <TableCell>{motorista.nome}</TableCell>
                    <TableCell>{motorista.email}</TableCell>
                    <TableCell>{motorista.veiculo?.tipo}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          motorista.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {motorista.status}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(motorista.created_at || '').toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleStatusChange(motorista.id!, motorista.status === 'ativo' ? 'inativo' : 'ativo')}>
                        {motorista.status === 'ativo' ? 'Inativar' : 'Ativar'}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(motorista.id!)}>
                        Excluir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Cards para mobile */}
        <div className="space-y-4 md:hidden">
          {isLoading ? (
            <div className="bg-card rounded-lg p-4 shadow-sm">
              <div className="text-center">Carregando...</div>
            </div>
          ) : motoristas.length === 0 ? (
            <div className="bg-card rounded-lg p-4 shadow-sm">
              <div className="text-center">Nenhum motorista encontrado.</div>
            </div>
          ) : (
            motoristas.map(motorista => (
              <div key={motorista.id} className="bg-card rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{motorista.nome}</div>
                  <div>
                    <span
                      className={`inline-flex items-center rounded-full bg-${motorista.status === 'ativo' ? 'green' : 'red'}-100 px-2.5 py-0.5 text-xs font-medium text-${motorista.status === 'ativo' ? 'green' : 'red'}-800`}
                    >
                      {motorista.status}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>ID: {motorista.id}</div>
                  <div>Email: {motorista.email}</div>
                  <div>Telefone: {motorista.telefone}</div>
                  <div>Veículo: {motorista.veiculo?.tipo}</div>
                  <div>Cadastro: {new Date(motorista.created_at || '').toLocaleDateString('pt-BR')}</div>
                </div>
                <div className="flex justify-end mt-3">
                  <Button variant="ghost" size="sm" onClick={() => handleStatusChange(motorista.id!, motorista.status === 'ativo' ? 'inativo' : 'ativo')}>
                    {motorista.status === 'ativo' ? 'Inativar' : 'Ativar'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(motorista.id!)}>
                    Excluir
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
