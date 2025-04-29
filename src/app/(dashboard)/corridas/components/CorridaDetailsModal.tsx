/**
 * CorridaDetailsModal.tsx
 * Modal para exibição dos detalhes de uma corrida.
 * Exibe informações completas sobre a corrida selecionada, agrupadas em seções.
 * 
 * Props:
 * - corrida: a corrida a ser exibida em detalhes (ou null, se não há corrida selecionada)
 * - open: estado de abertura do modal
 * - onOpenChange: função para alterar o estado de abertura do modal
 * 
 * Utiliza shadcn/ui, Tailwind e ícones Lucide para UI.
 */

import React from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import {
  Car, 
  User, 
  Truck, 
  MapPin, 
  FileText, 
  Calendar, 
  Phone,
  CheckCircle
} from 'lucide-react';
import { Corrida } from '@/lib/supabase/corridas';

interface CorridaDetailsModalProps {
  corrida: Corrida | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CorridaDetailsModal: React.FC<CorridaDetailsModalProps> = ({
  corrida,
  open,
  onOpenChange,
}) => {
  // Se não tiver corrida, mostrar mensagem informativa
  if (!corrida) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[1000px] max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-2 border-b sticky top-0 bg-background z-10">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Car className="h-6 w-6 text-primary" /> 
              Detalhes da Corrida
            </DialogTitle>
            <DialogDescription>
              Nenhuma corrida selecionada
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[450px] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 pb-2 border-b sticky top-0 bg-background z-10">
          <div className="flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" /> 
            <DialogTitle className="text-lg">Detalhes da Corrida</DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Informações completas sobre a corrida selecionada
          </DialogDescription>
        </DialogHeader>
        <div>
          {/* Barra de progresso da corrida */}
          <div className="px-4 py-3 border-b">
            {/* Barra de progresso da corrida */}
            {/* Barra de progresso - design shadcn/ui */}
            <div>
              {/* Status labels */}
              <div className="grid grid-cols-6 text-xs font-medium mb-1">
                <div className="text-center text-amber-700">Solicitada</div>
                <div className="text-center text-blue-700">Atribuída</div>
                <div className="text-center text-cyan-700">Coletando</div>
                <div className="text-center text-indigo-700">Transportando</div>
                <div className="text-center text-violet-700">Entregando</div>
                <div className="text-center text-green-700">Finalizada</div>
              </div>
              
              {/* Progress bar */}
              <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`absolute top-0 left-0 h-full transition-all ${corrida.status === 'pendente' ? 'bg-amber-500 w-[8%]' : 
                    corrida.status === 'atribuída' ? 'bg-blue-500 w-[25%]' : 
                    corrida.status === 'coletando' ? 'bg-cyan-600 w-[41%]' : 
                    corrida.status === 'transportando' ? 'bg-indigo-600 w-[58%]' : 
                    corrida.status === 'entregando' ? 'bg-violet-600 w-[75%]' : 
                    corrida.status === 'finalizada' ? 'bg-green-600 w-full' : 'bg-amber-500 w-[8%]'}`}
                />
              </div>
              
              {/* Indicators */}
              <div className="grid grid-cols-6 mt-1.5">
                {[
                  {status: "pendente", activeClass: "bg-amber-600 border-amber-300", ringClass: "ring-amber-300"},
                  {status: "atribuída", activeClass: "bg-blue-600 border-blue-300", ringClass: "ring-blue-300"},
                  {status: "coletando", activeClass: "bg-cyan-600 border-cyan-300", ringClass: "ring-cyan-300"},
                  {status: "transportando", activeClass: "bg-indigo-600 border-indigo-300", ringClass: "ring-indigo-300"},
                  {status: "entregando", activeClass: "bg-violet-600 border-violet-300", ringClass: "ring-violet-300"},
                  {status: "finalizada", activeClass: "bg-green-600 border-green-300", ringClass: "ring-green-300"}
                ].map((item, index) => {
                  const statusOrder = ["pendente", "atribuída", "coletando", "transportando", "entregando", "finalizada"];
                  const isActive = statusOrder.indexOf(corrida.status) >= statusOrder.indexOf(item.status);
                  const isCurrent = corrida.status === item.status;
                  
                  return (
                    <div key={index} className="flex justify-center">
                      <div className={`w-3 h-3 rounded-full border ${isActive ? item.activeClass : 'bg-background border-gray-300'} ${isCurrent ? `ring-2 ${item.ringClass}` : ''}`}>
                        {isActive && <CheckCircle className="w-2 h-2 text-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 p-2">
          {/* Informações do Cliente */}
          <div className="border rounded-md overflow-hidden">
            <div className="p-4">
              <h3 className="text-base font-medium mb-2 flex items-center gap-2">
                <User className="h-4 w-4 text-blue-500" />
                Informações do Cliente
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Nome</div>
                  <div className="font-medium">{corrida.solicitacao?.cliente_nome || '-'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Contato</div>
                  <div className="flex items-center gap-2 font-medium">
                    <Phone className="h-4 w-4 text-blue-500" />
                    {corrida.solicitacao?.cliente_contato || '-'}
                  </div>
                </div>
                {corrida.solicitacao?.cliente_email && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Email</div>
                    <div className="font-medium">{corrida.solicitacao.cliente_email}</div>
                  </div>
                )}
                {corrida.solicitacao?.cliente_empresa && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Empresa</div>
                    <div className="font-medium">{corrida.solicitacao.cliente_empresa}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Informações do Motorista */}
          <div className="border rounded-md overflow-hidden">
            <div className="p-4">
              <h3 className="text-base font-medium mb-2 flex items-center gap-2">
                <Car className="h-4 w-4 text-orange-500" />
                Informações do Motorista
              </h3>
              {corrida.motorista_nome ? (
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Nome</div>
                    <div className="font-medium text-base">{corrida.motorista_nome}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Status</div>
                    <div className="text-green-600 font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Ativo
                    </div>
                  </div>
                  {corrida.data_inicio && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Início da corrida</div>
                      <div className="font-medium">{new Date(corrida.data_inicio).toLocaleString('pt-BR')}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-orange-50 p-3 rounded-md text-orange-700">
                  Motorista ainda não atribuído a esta corrida
                </div>
              )}
            </div>
          </div>
          
          {/* Endereços */}
          <div className="border rounded-md overflow-hidden">
            <div className="p-4">
              <h3 className="text-base font-medium mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-500" />
                Endereços
              </h3>
              
              {/* Layout dos endereços no formato tabela - Origem */}
              <div className="mb-8">
                <div className="bg-green-50 rounded-lg p-2 mb-3">
                  <div className="text-base font-semibold flex items-center gap-2 text-green-700">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-700 text-sm font-bold">A</span>
                    Endereço de Origem
                  </div>
                </div>
                
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="mb-3">
                    <div className="text-sm text-muted-foreground">Endereço completo</div>
                    <div className="text-lg font-medium">{corrida.solicitacao?.endereco_origem || '-'}</div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">CEP</div>
                      <div className="font-medium">{corrida.solicitacao?.cep_origem || '-'}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground">Número</div>
                      <div className="font-medium">{corrida.solicitacao?.numero_origem || '-'}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground">Cidade</div>
                      <div className="font-medium">{corrida.solicitacao?.cidade_origem || '-'}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground">Estado</div>
                      <div className="font-medium">{corrida.solicitacao?.estado_origem || '-'}</div>
                    </div>
                  </div>
                  
                  {corrida.solicitacao?.ponto_referencia_origem && (
                    <div className="mt-3 bg-green-50 p-3 rounded border border-green-100">
                      <div className="text-sm text-muted-foreground">Ponto de Referência</div>
                      <div className="font-medium">{corrida.solicitacao.ponto_referencia_origem}</div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Layout dos endereços no formato tabela - Destino */}
              <div>
                <div className="bg-purple-50 rounded-lg p-2 mb-3">
                  <div className="text-base font-semibold flex items-center gap-2 text-purple-700">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-purple-100 text-purple-700 text-sm font-bold">B</span>
                    Endereço de Destino
                  </div>
                </div>
                
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="mb-3">
                    <div className="text-sm text-muted-foreground">Endereço completo</div>
                    <div className="text-lg font-medium">{corrida.solicitacao?.endereco_destino || '-'}</div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">CEP</div>
                      <div className="font-medium">{corrida.solicitacao?.cep_destino || '-'}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground">Número</div>
                      <div className="font-medium">{corrida.solicitacao?.numero_destino || '-'}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground">Cidade</div>
                      <div className="font-medium">{corrida.solicitacao?.cidade_destino || '-'}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground">Estado</div>
                      <div className="font-medium">{corrida.solicitacao?.estado_destino || '-'}</div>
                    </div>
                  </div>
                  
                  {corrida.solicitacao?.ponto_referencia_destino && (
                    <div className="mt-3 bg-purple-50 p-3 rounded border border-purple-100">
                      <div className="text-sm text-muted-foreground">Ponto de Referência</div>
                      <div className="font-medium">{corrida.solicitacao.ponto_referencia_destino}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Descrição e detalhes da carga */}
          <div className="border rounded-md overflow-hidden">
            <div className="p-4">
              <h3 className="text-base font-medium mb-2 flex items-center gap-2">
                <Truck className="h-4 w-4 text-amber-500" />
                Detalhes da Carga
              </h3>
              
              <div className="flex flex-col gap-4">
                <div className="space-y-4">
                  {corrida.solicitacao?.descricao && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Descrição</h4>
                      <div className="bg-amber-50 p-3 rounded whitespace-pre-wrap">
                        {corrida.solicitacao.descricao}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    {corrida.solicitacao?.tipo_veiculo_requerido && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Veículo</h4>
                        <div className="font-medium">{corrida.solicitacao.tipo_veiculo_requerido}</div>
                      </div>
                    )}
                    
                    {corrida.solicitacao?.dimensoes && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Dimensões</h4>
                        <div className="font-medium">{corrida.solicitacao.dimensoes}</div>
                      </div>
                    )}
                    
                    {corrida.solicitacao?.peso_aproximado && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Peso</h4>
                        <div className="font-medium">{corrida.solicitacao.peso_aproximado}</div>
                      </div>
                    )}
                    
                    {corrida.solicitacao?.quantidade_itens && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Quantidade</h4>
                        <div className="font-medium">{corrida.solicitacao.quantidade_itens}</div>
                      </div>
                    )}
                    
                    {corrida.solicitacao?.data_retirada && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Data de Retirada</h4>
                        <div className="font-medium">{new Date(corrida.solicitacao.data_retirada).toLocaleDateString('pt-BR')}</div>
                      </div>
                    )}
                    
                    {corrida.solicitacao?.horario_retirada && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Horário</h4>
                        <div className="font-medium">{corrida.solicitacao.horario_retirada}</div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Fotos da carga */}
                <div>
                  {corrida.solicitacao?.fotos_carga && corrida.solicitacao.fotos_carga.length > 0 ? (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Fotos da Carga</h4>
                      <div className="flex gap-2">
                        {corrida.solicitacao.fotos_carga.map((foto, index) => (
                          <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden border bg-muted">
                            <Image 
                              src={foto} 
                              alt={`Foto da carga ${index + 1}`} 
                              fill 
                              className="object-cover hover:scale-105 transition-transform"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground italic">
                      Nenhuma foto da carga disponível
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Informações adicionais e status da entrega */}
          {(corrida.observacoes || corrida.avaliacao || corrida.distancia_km || corrida.fotos_entrega || corrida.status === 'finalizada') && (
            <div className="border rounded-md overflow-hidden">
              <div className="p-4">
                <h3 className="text-base font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-cyan-500" />
                  {corrida.status === 'finalizada' ? 'Detalhes da Entrega' : 'Informações Adicionais'}
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-4">
                    {corrida.data_fim && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Data de Finalização</div>
                        <div className="font-medium">{new Date(corrida.data_fim).toLocaleString('pt-BR')}</div>
                      </div>
                    )}
                    
                    {corrida.distancia_km && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Distância Percorrida</div>
                        <div className="font-medium flex items-center gap-1">
                          <span className="text-cyan-600 font-semibold">{corrida.distancia_km}</span> km
                        </div>
                      </div>
                    )}
                    
                    {corrida.valor && corrida.status === 'finalizada' && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Valor Final</div>
                        <div className="bg-cyan-50 text-cyan-700 font-semibold px-3 py-1 rounded inline-block">
                          R$ {corrida.valor.toFixed(2).replace('.', ',')}
                        </div>
                      </div>
                    )}
                    
                    {corrida.avaliacao && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Avaliação do Cliente</div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={i < (corrida.avaliacao ?? 0) ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          ))}
                          <span className="ml-2 font-medium">{corrida.avaliacao}/5</span>
                        </div>
                      </div>
                    )}
                    
                    {corrida.observacoes && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Observações</div>
                        <div className="bg-gray-50 p-3 rounded whitespace-pre-wrap">{corrida.observacoes}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CorridaDetailsModal; 