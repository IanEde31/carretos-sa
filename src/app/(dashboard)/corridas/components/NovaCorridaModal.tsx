/**
 * NovaCorridaModal.tsx
 * Modal para criação de uma nova corrida com experiência aprimorada.
 * Contém um formulário intuitivo para entrada de dados do cliente, endereços e informações da carga.
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/use-toast';

// Importação dos componentes de abas
import ClienteTab from './cliente-tab';
import EnderecoTab from './endereco-tab'; 
import CargaTab from './carga-tab';

// Constantes para validação de arquivos
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Tipos de veículos padrão para fallback
const DEFAULT_TIPOS_VEICULOS = [
  { id: 'carro', nome: 'Carro' },
  { id: 'van', nome: 'Van' },
  { id: 'caminhao_pequeno', nome: 'Caminhão Pequeno' },
  { id: 'caminhao_medio', nome: 'Caminhão Médio' },
  { id: 'caminhao_grande', nome: 'Caminhão Grande' },
];

// Interface para o resultado da busca de CEP
interface CepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

// Schema para nova corrida com validação zod
const novaCorridaSchema = z.object({
  // Dados do cliente
  cliente_nome: z.string().min(3, 'Nome do cliente é obrigatório'),
  cliente_contato: z.string().min(9, 'Contato do cliente é obrigatório'),
  cliente_email: z.string().email('Email inválido').optional().or(z.literal('')),
  cliente_empresa: z.string().optional(),
  
  // Dados da origem
  cep_origem: z.string().regex(/^\d{5}-\d{3}$|^\d{8}$/, 'CEP inválido').optional().or(z.literal('')),
  endereco_origem: z.string().min(5, 'Endereço de origem é obrigatório'),
  numero_origem: z.string().min(1, 'Número é obrigatório'),
  complemento_origem: z.string().optional(),
  bairro_origem: z.string().min(2, 'Bairro é obrigatório'),
  cidade_origem: z.string().min(2, 'Cidade é obrigatória'),
  estado_origem: z.string().length(2, 'UF deve ter 2 letras'),
  ponto_referencia_origem: z.string().optional(),
  
  // Dados do destino
  cep_destino: z.string().regex(/^\d{5}-\d{3}$|^\d{8}$/, 'CEP inválido').optional().or(z.literal('')),
  endereco_destino: z.string().min(5, 'Endereço de destino é obrigatório'),
  numero_destino: z.string().min(1, 'Número é obrigatório'),
  complemento_destino: z.string().optional(),
  bairro_destino: z.string().min(2, 'Bairro é obrigatório'),
  cidade_destino: z.string().min(2, 'Cidade é obrigatória'),
  estado_destino: z.string().length(2, 'UF deve ter 2 letras'),
  ponto_referencia_destino: z.string().optional(),
  
  // Dados da carga e serviço
  data_retirada: z.date().optional(),
  horario_retirada: z.string().optional(),
  descricao: z.string().min(5, 'Descrição da carga é obrigatória'),
  dimensoes: z.string().optional(),
  peso_aproximado: z.string().optional(),
  quantidade_itens: z.string().optional(),
  tipo_veiculo_requerido: z.string(),
  numero_ajudantes: z.preprocess(
    (val) => {
      if (typeof val === 'string' && val.trim() === '') return 0;
      const num = Number(val);
      return isNaN(num) ? val : num;
    },
    z.number({ invalid_type_error: "Apenas números são permitidos" })
     .int({ message: "Deve ser um número inteiro" })
     .min(0, { message: "Não pode ser negativo" })
     .default(0)
  ),
  valor: z.string().optional(),
  observacoes: z.string().optional(),
  
  // Fotos da carga
  fotos_carga: z
    .any()
    .optional()
    .refine(
      (files) => {
        // Verificar se estamos no ambiente do cliente
        if (typeof window === 'undefined') return true;
        
        // Se não tiver arquivos, tudo bem (é opcional)
        if (!files || files.length === 0) return true;
        
        // Verificar se é um FileList
        if (!(files instanceof FileList)) return true;
        
        // Verificar o número máximo de 5 arquivos
        if (files.length > 5) {
          return false;
        }
        
        // Verificar o tamanho dos arquivos
        const isValidSize = Array.from(files).every((file) => file.size <= MAX_FILE_SIZE);
        if (!isValidSize) {
          return false;
        }

        // Verifica o tipo dos arquivos
        const fileList = files as FileList;
        return Array.from(fileList).every((file) => ACCEPTED_IMAGE_TYPES.includes(file.type));
      },
      'Formatos suportados: .jpg, .jpeg, .png e .webp'
    )
    .transform((files) => (files && files.length > 0 ? Array.from(files) : undefined)),
});

// Tipo para os valores do formulário
type NovaCorrridaValues = z.infer<typeof novaCorridaSchema>;

// Props do componente
interface NovaCorridaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
  tiposVeiculos?: {id: string, nome: string}[];
  onSubmit: (data: NovaCorrridaValues) => void;
}

const NovaCorridaModal: React.FC<NovaCorridaModalProps> = ({
  open,
  onOpenChange,
  isSubmitting,
  tiposVeiculos = DEFAULT_TIPOS_VEICULOS,
  onSubmit,
}) => {
  // Estado para a aba atual
  const [currentTab, setCurrentTab] = useState("cliente");
  
  // Estado para previews de fotos
  const [fotosCargaPreviews, setFotosCargaPreviews] = useState<string[]>([]);

  // Inicialização do formulário com react-hook-form e zod
  const form = useForm<NovaCorrridaValues>({
    resolver: zodResolver(novaCorridaSchema),
    defaultValues: {
      cliente_nome: '',
      cliente_contato: '',
      cliente_email: '',
      cliente_empresa: '',
      
      cep_origem: '',
      endereco_origem: '',
      numero_origem: '',
      complemento_origem: '',
      bairro_origem: '',
      cidade_origem: '',
      estado_origem: '',
      ponto_referencia_origem: '',
      
      cep_destino: '',
      endereco_destino: '',
      numero_destino: '',
      complemento_destino: '',
      bairro_destino: '',
      cidade_destino: '',
      estado_destino: '',
      ponto_referencia_destino: '',
      
      descricao: '',
      dimensoes: '',
      peso_aproximado: '',
      quantidade_itens: '',
      tipo_veiculo_requerido: '',
      valor: '',
      observacoes: '',
      numero_ajudantes: 0, // Ajustado para default numérico com z.preprocess
    },
  });
  
  // Função para lidar com a submissão do formulário
  const handleSubmit = async (data: NovaCorrridaValues) => {
    try {
      const custoAjudante = 100;
      // data.numero_ajudantes já é um número devido à transformação no schema Zod e tem default 0.
      const numeroAjudantes = data.numero_ajudantes;
      const custoTotalAjudantes = numeroAjudantes * custoAjudante;

      const valorCorridaOriginalString = data.valor || '0';
      // Normaliza o valor: remove pontos de milhar e substitui vírgula decimal por ponto.
      const valorNormalizado = valorCorridaOriginalString.replace(/\./g, '').replace(',', '.');
      const valorCorridaOriginal = parseFloat(valorNormalizado) || 0;
      
      const valorFinalCorrida = valorCorridaOriginal + custoTotalAjudantes;

      // Prepara os dados completos para submissão
      const dadosCompletos: NovaCorrridaValues = {
        ...data,
        // Formata o valor final de volta para string no formato monetário brasileiro (ex: "1.234,56")
        // O schema Zod para 'valor' espera uma string.
        valor: valorFinalCorrida.toLocaleString('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        numero_ajudantes: numeroAjudantes // Garante que o tipo está correto (já é número)
      };
      
      await onSubmit(dadosCompletos); 
      onOpenChange(false); // Fecha o modal em caso de sucesso
      toast({
        title: 'Sucesso!',
        description: 'Nova corrida criada com sucesso.',
        variant: 'default', // Usando 'default' para maior compatibilidade com shadcn/ui
      });
    } catch (error) {
      console.error('Erro ao processar formulário de corrida:', error);
      toast({
        title: 'Erro ao criar corrida',
        description: (error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.'),
        variant: 'destructive',
      });
    }
  };
  
  // Efeito para gerar previews de imagens quando arquivos são selecionados
  useEffect(() => {
    const fotosCarga = form.watch('fotos_carga');
    if (fotosCarga) {
      const newPreviews = Array.from(fotosCarga as File[]).map((file: File) => URL.createObjectURL(file));
      setFotosCargaPreviews(newPreviews);
      
      // Limpar URLs quando o componente for desmontado
      return () => {
        newPreviews.forEach(url => URL.revokeObjectURL(url));
      };
    }
  }, [form.watch('fotos_carga')]);
  
  // Verificar campos obrigatórios antes de mudar de aba
  const validateTabTransition = (targetTab: string) => {
    if (currentTab === 'cliente' && targetTab === 'endereco') {
      const { cliente_nome, cliente_contato } = form.getValues();
      
      if (!cliente_nome || cliente_nome.length < 3) {
        form.setError('cliente_nome', { 
          type: 'manual', 
          message: 'Nome do cliente é obrigatório'
        });
        return false;
      }
      
      if (!cliente_contato || cliente_contato.length < 9) {
        form.setError('cliente_contato', { 
          type: 'manual', 
          message: 'Contato do cliente é obrigatório'
        });
        return false;
      }
      
      return true;
    }
    
    if (currentTab === 'endereco' && targetTab === 'carga') {
      const { 
        endereco_origem, numero_origem, bairro_origem, cidade_origem, estado_origem,
        endereco_destino, numero_destino, bairro_destino, cidade_destino, estado_destino 
      } = form.getValues();
      
      // Validar campos de origem
      if (!endereco_origem || endereco_origem.length < 5) {
        form.setError('endereco_origem', { 
          type: 'manual', 
          message: 'Endereço de origem é obrigatório'
        });
        return false;
      }
      
      if (!numero_origem) {
        form.setError('numero_origem', { 
          type: 'manual', 
          message: 'Número é obrigatório'
        });
        return false;
      }
      
      if (!bairro_origem || bairro_origem.length < 2) {
        form.setError('bairro_origem', { 
          type: 'manual', 
          message: 'Bairro é obrigatório'
        });
        return false;
      }
      
      if (!cidade_origem || cidade_origem.length < 2) {
        form.setError('cidade_origem', { 
          type: 'manual', 
          message: 'Cidade é obrigatória'
        });
        return false;
      }
      
      if (!estado_origem || estado_origem.length !== 2) {
        form.setError('estado_origem', { 
          type: 'manual', 
          message: 'UF deve ter 2 letras'
        });
        return false;
      }
      
      // Validar campos de destino
      if (!endereco_destino || endereco_destino.length < 5) {
        form.setError('endereco_destino', { 
          type: 'manual', 
          message: 'Endereço de destino é obrigatório'
        });
        return false;
      }
      
      if (!numero_destino) {
        form.setError('numero_destino', { 
          type: 'manual', 
          message: 'Número é obrigatório'
        });
        return false;
      }
      
      if (!bairro_destino || bairro_destino.length < 2) {
        form.setError('bairro_destino', { 
          type: 'manual', 
          message: 'Bairro é obrigatório'
        });
        return false;
      }
      
      if (!cidade_destino || cidade_destino.length < 2) {
        form.setError('cidade_destino', { 
          type: 'manual', 
          message: 'Cidade é obrigatória'
        });
        return false;
      }
      
      if (!estado_destino || estado_destino.length !== 2) {
        form.setError('estado_destino', { 
          type: 'manual', 
          message: 'UF deve ter 2 letras'
        });
        return false;
      }
      
      return true;
    }
    
    return true;
  };
  
  // Funções para navegação entre abas com validação
  const handleClienteNext = () => {
    if (validateTabTransition('endereco')) {
      setCurrentTab('endereco');
    }
  };
  
  const handleEnderecoNext = () => {
    if (validateTabTransition('carga')) {
      setCurrentTab('carga');
    }
  };
  
  const handleEnderecoBack = () => {
    setCurrentTab('cliente');
  };
  
  const handleCargaBack = () => {
    setCurrentTab('endereco');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-5xl w-full max-h-[95vh] overflow-y-auto p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            Nova Corrida
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="pb-6">
              <Tabs defaultValue="cliente" value={currentTab} className="w-full" onValueChange={setCurrentTab}>
                <div className="mb-4 border-b">
                  <TabsList className="w-full justify-start">
                    <TabsTrigger 
                      value="cliente" 
                      className="flex items-center gap-1 px-4 data-[state=active]:text-blue-600"
                    >
                      Cliente
                    </TabsTrigger>
                    <TabsTrigger 
                      value="endereco" 
                      className="flex items-center gap-1 px-4 data-[state=active]:text-green-600"
                    >
                      Endereços
                    </TabsTrigger>
                    <TabsTrigger 
                      value="carga" 
                      className="flex items-center gap-1 px-4 data-[state=active]:text-amber-600"
                    >
                      Carga
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="cliente" className="pb-4">
                  <ClienteTab 
                    form={form} 
                    onProximoClick={handleClienteNext} 
                  />
                </TabsContent>
                
                <TabsContent value="endereco" className="pb-4">
                  <EnderecoTab 
                    form={form} 
                    onAnteriorClick={handleEnderecoBack}
                    onProximoClick={handleEnderecoNext}
                  />
                </TabsContent>
                
                <TabsContent value="carga" className="pb-4">
                  <CargaTab 
                    form={form}
                    onAnteriorClick={handleCargaBack}
                    tiposVeiculos={tiposVeiculos}
                    fotosCargaPreviews={fotosCargaPreviews}
                    isSubmitting={isSubmitting}
                  />
                </TabsContent>
              </Tabs>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NovaCorridaModal;
export type { NovaCorrridaValues };