'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Car,
  CheckCircle,
  XCircle,
  Upload,
  MapPin,
  User,
  Phone,
  FileText,
  Truck,
  Package
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/use-toast';
import { 
  getCorridas, 
  getMotoristas, 
  criarSolicitacaoECorrida, 
  atribuirMotorista, 
  finalizarCorrida, 
  cancelarCorrida, 
  NovaCorridaForm, 
  Corrida,
  getTiposVeiculos
} from '@/lib/supabase/corridas';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Tamanho máximo permitido para upload de imagens (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;
// Formatos permitidos de imagens
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// Schema para validação de formulário de nova corrida
const novaCorridaSchema = z.object({
  cliente_nome: z.string().min(3, 'Nome do cliente deve ter pelo menos 3 caracteres'),
  cliente_contato: z.string().min(8, 'Contato deve ter pelo menos 8 caracteres'),
  endereco_origem: z.string().min(5, 'Endereço de origem deve ter pelo menos 5 caracteres'),
  endereco_destino: z.string().min(5, 'Endereço de destino deve ter pelo menos 5 caracteres'),
  descricao: z.string().optional(),
  tipo_veiculo_requerido: z.string().optional(),
  fotos_carga: z
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
        return Array.from(fileList).every((file) => file.size <= MAX_FILE_SIZE);
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
        return Array.from(fileList).every((file) => ACCEPTED_IMAGE_TYPES.includes(file.type));
      },
      'Formatos suportados: .jpg, .jpeg, .png e .webp'
    )
    .transform((files) => (files && files.length > 0 ? Array.from(files) : undefined)),
});

// Schema para atribuir motorista
const atribuirMotoristaSchema = z.object({
  motorista_id: z.string().min(1, 'Selecione um motorista'),
});

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
        return Array.from(fileList).every((file) => file.size <= MAX_FILE_SIZE);
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
        return Array.from(fileList).every((file) => ACCEPTED_IMAGE_TYPES.includes(file.type));
      },
      'Formatos suportados: .jpg, .jpeg, .png e .webp'
    )
    .transform((files) => (files && files.length > 0 ? Array.from(files) : undefined)),
});

// Schema para cancelar corrida
const cancelarCorridaSchema = z.object({
  motivo: z.string().min(3, 'Informe o motivo do cancelamento'),
});

type NovaCorrridaValues = z.infer<typeof novaCorridaSchema>;
type AtribuirMotoristaValues = z.infer<typeof atribuirMotoristaSchema>;
type FinalizarCorridaValues = z.infer<typeof finalizarCorridaSchema>;
type CancelarCorridaValues = z.infer<typeof cancelarCorridaSchema>;

export default function CorridasPage() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [corridas, setCorridas] = useState<Corrida[]>([]);
  const [loading, setLoading] = useState(true);
  const [motoristas, setMotoristas] = useState<{id: string, nome: string}[]>([]);
  const [corridaSelecionada, setCorridaSelecionada] = useState<Corrida | null>(null);
  const [atribuirDialogOpen, setAtribuirDialogOpen] = useState(false);
  const [finalizarDialogOpen, setFinalizarDialogOpen] = useState(false);
  const [cancelarDialogOpen, setCancelarDialogOpen] = useState(false);
  const [tiposVeiculos, setTiposVeiculos] = useState<{id: string, nome: string}[]>([]);
  const [fotosCargaPreviews, setFotosCargaPreviews] = useState<string[]>([]);
  const [fotosEntregaPreviews, setFotosEntregaPreviews] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState("cliente");
  
  // Formulários com React Hook Form
  const novaCorrida = useForm<NovaCorrridaValues>({
    resolver: zodResolver(novaCorridaSchema),
    defaultValues: {
      cliente_nome: '',
      cliente_contato: '',
      endereco_origem: '',
      endereco_destino: '',
      descricao: '',
      tipo_veiculo_requerido: 'carro',
    },
  });
  
  const atribuirMotoristaForm = useForm<AtribuirMotoristaValues>({
    resolver: zodResolver(atribuirMotoristaSchema),
    defaultValues: {
      motorista_id: '',
    },
  });
  
  const finalizarCorridaForm = useForm<FinalizarCorridaValues>({
    resolver: zodResolver(finalizarCorridaSchema),
    defaultValues: {
      valor: '',
      observacoes: '',
      distancia_km: '',
      avaliacao: '5',
      feedback: '',
    },
  });
  
  const cancelarCorridaForm = useForm<CancelarCorridaValues>({
    resolver: zodResolver(cancelarCorridaSchema),
    defaultValues: {
      motivo: '',
    },
  });
  
  useEffect(() => {
    // Carregar corridas ao iniciar o componente
    loadCorridas();
    loadMotoristas();
    setTiposVeiculos(getTiposVeiculos());
  }, []);
  
  useEffect(() => {
    const fotosCargaField = novaCorrida.watch('fotos_carga');
    const fotos = fotosCargaField;
    
    if (fotos && fotos.length > 0) {
      const previews = Array.from(fotos).map(file => URL.createObjectURL(file));
      setFotosCargaPreviews(previews);
      
      // Limpeza dos blobs quando o componente desmontar
      return () => {
        previews.forEach(url => URL.revokeObjectURL(url));
      };
    }
  }, [novaCorrida]);
  
  useEffect(() => {
    const fotosEntregaField = finalizarCorridaForm.watch('fotos_entrega');
    const fotos = fotosEntregaField;
    
    if (fotos && fotos.length > 0) {
      const previews = Array.from(fotos).map(file => URL.createObjectURL(file));
      setFotosEntregaPreviews(previews);
      
      // Limpeza dos blobs quando o componente desmontar
      return () => {
        previews.forEach(url => URL.revokeObjectURL(url));
      };
    }
  }, [finalizarCorridaForm]);
  
  // Carregar dados
  async function loadCorridas() {
    setLoading(true);
    try {
      const data = await getCorridas();
      setCorridas(data);
    } catch (error) {
      console.error('Erro ao carregar corridas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as corridas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }
  
  async function loadMotoristas() {
    try {
      const data = await getMotoristas();
      setMotoristas(data);
    } catch (error) {
      console.error('Erro ao carregar motoristas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de motoristas.",
        variant: "destructive",
      });
    }
  }
  
  // Função para lidar com o envio do formulário
  async function onSubmit(data: NovaCorrridaValues) {
    setIsSubmitting(true);
    
    try {
      // Criar nova solicitação e corrida no Supabase
      const novaCorridaData: NovaCorridaForm = {
        cliente_nome: data.cliente_nome,
        cliente_contato: data.cliente_contato,
        endereco_origem: data.endereco_origem,
        endereco_destino: data.endereco_destino,
        descricao: data.descricao,
        tipo_veiculo_requerido: data.tipo_veiculo_requerido,
        fotos_carga: data.fotos_carga as File[]
      };
      
      await criarSolicitacaoECorrida(novaCorridaData);
      
      toast({
        title: "Sucesso",
        description: "Corrida cadastrada com sucesso!",
        variant: "default",
      });
      
      // Resetar o formulário e fechar o modal
      novaCorrida.reset();
      setFotosCargaPreviews([]);
      setOpen(false);
      
      // Recarregar a lista de corridas
      loadCorridas();
    } catch (error) {
      console.error('Erro ao criar nova corrida:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar nova corrida. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  // Função para atribuir um motorista a uma corrida
  async function onAtribuir(data: AtribuirMotoristaValues) {
    if (!corridaSelecionada?.id) return;
    
    setIsSubmitting(true);
    
    try {
      await atribuirMotorista(corridaSelecionada.id, data.motorista_id);
      
      toast({
        title: "Sucesso",
        description: "Motorista atribuído com sucesso!",
        variant: "default",
      });
      
      // Resetar o formulário e fechar o modal
      atribuirMotoristaForm.reset();
      setAtribuirDialogOpen(false);
      
      // Recarregar a lista de corridas
      loadCorridas();
    } catch (error) {
      console.error('Erro ao atribuir motorista:', error);
      toast({
        title: "Erro",
        description: "Erro ao atribuir motorista. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  // Função para finalizar uma corrida
  async function onFinalizar(data: FinalizarCorridaValues) {
    if (!corridaSelecionada?.id) return;
    
    setIsSubmitting(true);
    
    try {
      await finalizarCorrida(
        corridaSelecionada.id, 
        parseFloat(data.valor), 
        data.observacoes,
        data.fotos_entrega as File[],
        data.avaliacao ? parseInt(data.avaliacao) : undefined,
        data.feedback,
        data.distancia_km ? parseFloat(data.distancia_km) : undefined
      );
      
      toast({
        title: "Sucesso",
        description: "Corrida finalizada com sucesso!",
        variant: "default",
      });
      
      // Resetar o formulário e fechar o modal
      finalizarCorridaForm.reset();
      setFinalizarDialogOpen(false);
      
      // Recarregar a lista de corridas
      loadCorridas();
    } catch (error) {
      console.error('Erro ao finalizar corrida:', error);
      toast({
        title: "Erro",
        description: "Erro ao finalizar corrida. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  // Função para cancelar uma corrida
  async function onCancelar(data: CancelarCorridaValues) {
    if (!corridaSelecionada?.id) return;
    
    setIsSubmitting(true);
    
    try {
      await cancelarCorrida(corridaSelecionada.id, data.motivo);
      
      toast({
        title: "Sucesso",
        description: "Corrida cancelada com sucesso!",
        variant: "default",
      });
      
      // Resetar o formulário e fechar o modal
      cancelarCorridaForm.reset();
      setCancelarDialogOpen(false);
      
      // Recarregar a lista de corridas
      loadCorridas();
    } catch (error) {
      console.error('Erro ao cancelar corrida:', error);
      toast({
        title: "Erro",
        description: "Erro ao cancelar corrida. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Corridas</h1>
            <p className="text-muted-foreground">
              Gerencie as corridas e solicitações de clientes
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova Corrida
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>Nova Corrida</DialogTitle>
                <DialogDescription>
                  Adicione uma nova corrida ao sistema
                </DialogDescription>
              </DialogHeader>
              <Form {...novaCorrida}>
                <form onSubmit={novaCorrida.handleSubmit(onSubmit)} className="space-y-4">
                  <ScrollArea className="h-[60vh]">
                    <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                      <TabsList className="grid grid-cols-3 mb-4">
                        <TabsTrigger value="cliente" className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Cliente
                        </TabsTrigger>
                        <TabsTrigger value="endereco" className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Endereços
                        </TabsTrigger>
                        <TabsTrigger value="carga" className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Carga
                        </TabsTrigger>
                      </TabsList>
                      
                      {/* Tab: Informações do Cliente */}
                      <TabsContent value="cliente" className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 gap-6">
                          <Card>
                            <CardContent className="pt-6">
                              <div className="space-y-4">
                                <FormField
                                  control={novaCorrida.control}
                                  name="cliente_nome"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Nome do Cliente
                                      </FormLabel>
                                      <FormControl>
                                        <Input placeholder="Nome completo do cliente" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={novaCorrida.control}
                                  name="cliente_contato"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        Contato do Cliente
                                      </FormLabel>
                                      <FormControl>
                                        <Input placeholder="Telefone ou email do cliente" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </CardContent>
                          </Card>
                          
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              onClick={() => setCurrentTab("endereco")}
                              className="flex items-center gap-2"
                            >
                              Próximo
                              <MapPin className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                      
                      {/* Tab: Endereços */}
                      <TabsContent value="endereco" className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 gap-6">
                          <Card>
                            <CardContent className="pt-6">
                              <div className="space-y-4">
                                <FormField
                                  control={novaCorrida.control}
                                  name="endereco_origem"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        Endereço de Origem
                                      </FormLabel>
                                      <FormControl>
                                        <Input placeholder="Endereço completo de coleta" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={novaCorrida.control}
                                  name="endereco_destino"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        Endereço de Destino
                                      </FormLabel>
                                      <FormControl>
                                        <Input placeholder="Endereço completo de entrega" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </CardContent>
                          </Card>
                          
                          <div className="flex justify-between">
                            <Button
                              type="button"
                              onClick={() => setCurrentTab("cliente")}
                              variant="outline"
                              className="flex items-center gap-2"
                            >
                              <User className="w-4 h-4" />
                              Anterior
                            </Button>
                            <Button
                              type="button"
                              onClick={() => setCurrentTab("carga")}
                              className="flex items-center gap-2"
                            >
                              Próximo
                              <Package className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                      
                      {/* Tab: Informações da Carga */}
                      <TabsContent value="carga" className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 gap-6">
                          <Card>
                            <CardContent className="pt-6">
                              <div className="space-y-4">
                                <FormField
                                  control={novaCorrida.control}
                                  name="descricao"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Descrição da Carga
                                      </FormLabel>
                                      <FormControl>
                                        <Textarea 
                                          placeholder="Descreva os itens que serão transportados, quantidade, peso aproximado, etc." 
                                          className="min-h-[100px]" 
                                          {...field} 
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={novaCorrida.control}
                                  name="tipo_veiculo_requerido"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="flex items-center gap-2">
                                        <Truck className="w-4 h-4" />
                                        Tipo de Veículo Necessário
                                      </FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Selecione o tipo de veículo" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {tiposVeiculos.map((tipo) => (
                                            <SelectItem key={tipo.id} value={tipo.id}>
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
                                  control={novaCorrida.control}
                                  name="fotos_carga"
                                  render={({ field: { onChange, ...fieldProps } }) => (
                                    <FormItem>
                                      <FormLabel className="flex items-center gap-2">
                                        <Image className="w-4 h-4" />
                                        Fotos da Carga
                                      </FormLabel>
                                      <FormControl>
                                        <div className="grid gap-4">
                                          <div className="flex items-center justify-center w-full">
                                            <Label
                                              htmlFor="fotos_upload"
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
                                                id="fotos_upload"
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                  onChange(e.target.files);
                                                }}
                                                {...fieldProps}
                                              />
                                            </Label>
                                          </div>
                                          
                                          {/* Mostrar previews de imagens */}
                                          {fotosCargaPreviews.length > 0 && (
                                            <div className="grid grid-cols-3 gap-2 mt-2">
                                              {fotosCargaPreviews.map((url, i) => (
                                                <div key={i} className="relative aspect-square rounded-md overflow-hidden">
                                                  <Image 
                                                    src={url} 
                                                    alt={`Foto de carga ${i+1}`}
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
                                        Adicione até 5 fotos da carga para melhor visualização
                                      </FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </CardContent>
                          </Card>
                          
                          <div className="flex justify-between">
                            <Button
                              type="button"
                              onClick={() => setCurrentTab("endereco")}
                              variant="outline"
                              className="flex items-center gap-2"
                            >
                              <MapPin className="w-4 h-4" />
                              Anterior
                            </Button>
                            <Button 
                              type="submit" 
                              disabled={isSubmitting}
                              className="flex items-center gap-2"
                            >
                              {isSubmitting ? "Cadastrando..." : "Cadastrar Corrida"}
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </ScrollArea>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar corridas..."
              className="pl-8"
            />
          </div>
          <Button variant="outline" size="sm" className="h-9">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
        </div>
        
        {/* Tabela para desktop */}
        <div className="hidden md:block rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {corridas.map((corrida) => (
                <TableRow key={corrida.id}>
                  <TableCell>{corrida.id?.substring(0, 8)}</TableCell>
                  <TableCell>{corrida.solicitacao?.cliente_nome}</TableCell>
                  <TableCell>{corrida.solicitacao?.endereco_origem?.substring(0, 30)}...</TableCell>
                  <TableCell>{corrida.solicitacao?.endereco_destino?.substring(0, 30)}...</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        corrida.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                        corrida.status === 'atribuída' ? 'bg-blue-100 text-blue-800' :
                        corrida.status === 'finalizada' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {corrida.status}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(corrida.created_at || '').toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => {
                            setCorridaSelecionada(corrida);
                            setAtribuirDialogOpen(true);
                          }}
                          disabled={corrida.status !== 'pendente'}
                        >
                          <Car className="mr-2 h-4 w-4" />
                          Atribuir Motorista
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setCorridaSelecionada(corrida);
                            setFinalizarDialogOpen(true);
                          }}
                          disabled={corrida.status !== 'atribuída'}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Finalizar Corrida
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setCorridaSelecionada(corrida);
                            setCancelarDialogOpen(true);
                          }}
                          disabled={corrida.status === 'finalizada' || corrida.status === 'cancelada'}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancelar Corrida
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Cards para mobile */}
        <div className="space-y-4 md:hidden">
          {corridas.length === 0 && !loading && (
            <div className="bg-card rounded-lg p-4 shadow-sm text-center">
              <p className="text-muted-foreground">Nenhuma corrida encontrada.</p>
            </div>
          )}
          {loading && (
            <div className="bg-card rounded-lg p-4 shadow-sm text-center">
              <p className="text-muted-foreground">Carregando corridas...</p>
            </div>
          )}
          {corridas.map((corrida) => (
            <div key={corrida.id} className="bg-card rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">Corrida #{corrida.id?.substring(0, 8)}</div>
                <div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      corrida.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                      corrida.status === 'atribuída' ? 'bg-blue-100 text-blue-800' :
                      corrida.status === 'finalizada' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}
                  >
                    {corrida.status}
                  </span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Cliente: {corrida.solicitacao?.cliente_nome}</div>
                <div>Origem: {corrida.solicitacao?.endereco_origem}</div>
                <div>Destino: {corrida.solicitacao?.endereco_destino}</div>
                <div>Data: {new Date(corrida.created_at || '').toLocaleDateString('pt-BR')}</div>
              </div>
              <div className="flex justify-end mt-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => {
                        setCorridaSelecionada(corrida);
                        setAtribuirDialogOpen(true);
                      }}
                      disabled={corrida.status !== 'pendente'}
                    >
                      <Car className="mr-2 h-4 w-4" />
                      Atribuir Motorista
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setCorridaSelecionada(corrida);
                        setFinalizarDialogOpen(true);
                      }}
                      disabled={corrida.status !== 'atribuída'}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Finalizar Corrida
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setCorridaSelecionada(corrida);
                        setCancelarDialogOpen(true);
                      }}
                      disabled={corrida.status === 'finalizada' || corrida.status === 'cancelada'}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancelar Corrida
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Diálogo para atribuir motorista */}
      <Dialog open={atribuirDialogOpen} onOpenChange={setAtribuirDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Atribuir Motorista</DialogTitle>
            <DialogDescription>
              Selecione um motorista para realizar esta corrida
            </DialogDescription>
          </DialogHeader>
          <Form {...atribuirMotoristaForm}>
            <form onSubmit={atribuirMotoristaForm.handleSubmit(onAtribuir)} className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="font-medium text-sm mb-2">Detalhes da Corrida</h3>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex items-start gap-2">
                          <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <span className="text-muted-foreground">Cliente:</span>
                          <span className="font-medium">{corridaSelecionada?.solicitacao?.cliente_nome}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <span className="text-muted-foreground">Origem:</span>
                          <span className="font-medium">{corridaSelecionada?.solicitacao?.endereco_origem}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <span className="text-muted-foreground">Destino:</span>
                          <span className="font-medium">{corridaSelecionada?.solicitacao?.endereco_destino}</span>
                        </div>
                      </div>
                    </div>
                    
                    <FormField
                      control={atribuirMotoristaForm.control}
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
                <Button type="button" variant="outline" onClick={() => setAtribuirDialogOpen(false)}>
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
      
      {/* Diálogo para finalizar corrida */}
      <Dialog open={finalizarDialogOpen} onOpenChange={setFinalizarDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Finalizar Corrida</DialogTitle>
            <DialogDescription>
              Registre os detalhes da finalização da corrida
            </DialogDescription>
          </DialogHeader>
          <Form {...finalizarCorridaForm}>
            <form onSubmit={finalizarCorridaForm.handleSubmit(onFinalizar)} className="space-y-4">
              <ScrollArea className="h-[60vh]">
                <Tabs defaultValue="detalhes" className="w-full">
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="detalhes" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Detalhes
                    </TabsTrigger>
                    <TabsTrigger value="fotos" className="flex items-center gap-2">
                      <Image className="w-4 h-4" />
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
                                <span className="font-medium">{corridaSelecionada?.solicitacao?.cliente_nome}</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <Car className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                <span className="text-muted-foreground">Motorista:</span>
                                <span className="font-medium">{corridaSelecionada?.motorista_nome}</span>
                              </div>
                            </div>
                          </div>
                          
                          <FormField
                            control={finalizarCorridaForm.control}
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
                            control={finalizarCorridaForm.control}
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
                            control={finalizarCorridaForm.control}
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
                            control={finalizarCorridaForm.control}
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
                            control={finalizarCorridaForm.control}
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
                          control={finalizarCorridaForm.control}
                          name="fotos_entrega"
                          render={({ field: { onChange, ...fieldProps } }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Image className="w-4 h-4" />
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
                                        }}
                                        {...fieldProps}
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
                <Button type="button" variant="outline" onClick={() => setFinalizarDialogOpen(false)}>
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
      
      {/* Diálogo para cancelar corrida */}
      <Dialog open={cancelarDialogOpen} onOpenChange={setCancelarDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cancelar Corrida</DialogTitle>
            <DialogDescription>
              Informe o motivo do cancelamento da corrida
            </DialogDescription>
          </DialogHeader>
          <Form {...cancelarCorridaForm}>
            <form onSubmit={cancelarCorridaForm.handleSubmit(onCancelar)} className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="font-medium text-sm mb-2">Informações da Corrida</h3>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex items-start gap-2">
                          <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <span className="text-muted-foreground">Cliente:</span>
                          <span className="font-medium">{corridaSelecionada?.solicitacao?.cliente_nome}</span>
                        </div>
                        {corridaSelecionada?.motorista_nome && (
                          <div className="flex items-start gap-2">
                            <Car className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <span className="text-muted-foreground">Motorista:</span>
                            <span className="font-medium">{corridaSelecionada?.motorista_nome}</span>
                          </div>
                        )}
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <span className="text-muted-foreground">Origem:</span>
                          <span className="font-medium">{corridaSelecionada?.solicitacao?.endereco_origem}</span>
                        </div>
                      </div>
                    </div>
                    
                    <FormField
                      control={cancelarCorridaForm.control}
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
                <Button type="button" variant="outline" onClick={() => setCancelarDialogOpen(false)}>
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

    </div>
  );
}
