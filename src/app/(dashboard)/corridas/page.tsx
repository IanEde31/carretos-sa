'use client';

import { useEffect, useState } from 'react';
import CorridasList from './components/CorridasList';
import CorridaDetailsModal from './components/CorridaDetailsModal';
import AtribuirMotoristaModal from './components/AtribuirMotoristaModal';
import FinalizarCorridaModal from './components/FinalizarCorridaModal';
import CancelarCorridaModal from './components/CancelarCorridaModal';
import NovaCorridaModal, { NovaCorrridaValues } from './components/NovaCorridaModal';

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
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
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
import { Card, CardContent } from '@/components/ui/card';
import { 
  User, 
  Search, 
  Plus, 
  MapPin,
  Car,
  Check,
  XCircle,
  Filter,
} from 'lucide-react';

// Constantes para validação de arquivos
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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

// Tipos de dados para os formulários
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
  const [fotosEntregaPreviews, setFotosEntregaPreviews] = useState<string[]>([]);

  // Estado para o modal de detalhes
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  
  // Formulários com React Hook Form
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
      // Criar nova solicitação e corrida no Supabase com todos os campos do formulário
      const novaCorridaData: NovaCorridaForm = {
        // Dados do cliente
        cliente_nome: data.cliente_nome,
        cliente_contato: data.cliente_contato,
        cliente_email: data.cliente_email,
        cliente_empresa: data.cliente_empresa,
        
        // Dados detalhados de origem
        cep_origem: data.cep_origem,
        endereco_origem: data.endereco_origem,
        numero_origem: data.numero_origem,
        complemento_origem: data.complemento_origem,
        bairro_origem: data.bairro_origem,
        cidade_origem: data.cidade_origem,
        estado_origem: data.estado_origem,
        ponto_referencia_origem: data.ponto_referencia_origem,
        
        // Dados detalhados de destino
        cep_destino: data.cep_destino,
        endereco_destino: data.endereco_destino,
        numero_destino: data.numero_destino,
        complemento_destino: data.complemento_destino,
        bairro_destino: data.bairro_destino,
        cidade_destino: data.cidade_destino,
        estado_destino: data.estado_destino,
        ponto_referencia_destino: data.ponto_referencia_destino,
        
        // Dados da carga
        descricao: data.descricao,
        dimensoes: data.dimensoes,
        peso_aproximado: data.peso_aproximado,
        quantidade_itens: data.quantidade_itens,
        tipo_veiculo_requerido: data.tipo_veiculo_requerido,
        valor: data.valor,
        fotos_carga: data.fotos_carga as File[],
        
        // Dados adicionais
        observacoes: data.observacoes,
        data_retirada: data.data_retirada,
        horario_retirada: data.horario_retirada
      };
      
      await criarSolicitacaoECorrida(novaCorridaData);
      
      toast({
        title: "Sucesso",
        description: "Corrida cadastrada com sucesso!",
        variant: "default",
      });
      
      // Resetar o formulário
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
            {/* Diálogo para nova corrida - extraído para componente dedicado */}
            {/* Veja src/app/(dashboard)/corridas/components/NovaCorridaModal.tsx */}
            <NovaCorridaModal
              open={open}
              onOpenChange={setOpen}
              isSubmitting={isSubmitting}
              tiposVeiculos={tiposVeiculos}
              onSubmit={onSubmit}
            />
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
        
        {/* Lista de Corridas extraída para componente dedicado */}
        {/* Veja src/app/(dashboard)/corridas/components/CorridasList.tsx */}
        <CorridasList
          corridas={corridas}
          loading={loading}
          corridaSelecionada={corridaSelecionada}
          onSelect={(corrida) => {
            setCorridaSelecionada(corrida);
            setDetailsModalOpen(true);
          }}
          onAtribuir={(corrida) => {
            setCorridaSelecionada(corrida);
            setAtribuirDialogOpen(true);
          }}
          onFinalizar={(corrida) => {
            setCorridaSelecionada(corrida);
            setFinalizarDialogOpen(true);
          }}
          onCancelar={(corrida) => {
            setCorridaSelecionada(corrida);
            setCancelarDialogOpen(true);
          }}
        />
      </div>
      
      {/* Diálogo para atribuir motorista - extraído para componente dedicado */}
      {/* Veja src/app/(dashboard)/corridas/components/AtribuirMotoristaModal.tsx */}
      <AtribuirMotoristaModal
        corrida={corridaSelecionada}
        motoristas={motoristas}
        isSubmitting={isSubmitting}
        open={atribuirDialogOpen}
        onOpenChange={setAtribuirDialogOpen}
        onSubmit={onAtribuir}
      />
      
      {/* Diálogo para finalizar corrida - extraído para componente dedicado */}
      {/* Veja src/app/(dashboard)/corridas/components/FinalizarCorridaModal.tsx */}
      <FinalizarCorridaModal
        corrida={corridaSelecionada}
        fotosEntregaPreviews={fotosEntregaPreviews}
        isSubmitting={isSubmitting}
        open={finalizarDialogOpen}
        onOpenChange={setFinalizarDialogOpen}
        onSubmit={onFinalizar}
        onFotoChange={(files) => {
          if (files && files.length > 0) {
            const previews = Array.from(files).map(file => URL.createObjectURL(file));
            setFotosEntregaPreviews(previews);
          }
        }}
      />
      
      {/* Modal de Detalhes da Corrida - extraído para componente dedicado */}
      {/* Veja src/app/(dashboard)/corridas/components/CorridaDetailsModal.tsx */}
      <CorridaDetailsModal
        corrida={corridaSelecionada}
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
      />
      
      {/* Diálogo para cancelar corrida - extraído para componente dedicado */}
      {/* Veja src/app/(dashboard)/corridas/components/CancelarCorridaModal.tsx */}
      <CancelarCorridaModal
        corrida={corridaSelecionada}
        isSubmitting={isSubmitting}
        open={cancelarDialogOpen}
        onOpenChange={setCancelarDialogOpen}
        onSubmit={onCancelar}
      />

    </div>
  );
}
