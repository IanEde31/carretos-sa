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
      <DialogContent className="max-w-[1000px] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-2 border-b sticky top-0 bg-background z-10">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Car className="h-6 w-6 text-primary" /> 
            Detalhes da Corrida
          </DialogTitle>
          <DialogDescription>
            Informações completas sobre a corrida selecionada
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 pt-4 grid gap-8">
          {/* Cabeçalho da corrida */}
          <div className="flex flex-col gap-3 bg-background rounded-lg p-6 border shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="col-span-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  Corrida <span className="font-mono bg-primary/10 px-3 py-1 rounded-md text-primary text-base">
                    #{corrida.id?.substring(0, 8)}
                  </span>
                </h2>
              </div>
              
              <div className="col-span-4 flex justify-center">
                <p className={`text-base font-semibold px-4 py-2 rounded-full flex items-center gap-2 ${
                  corrida.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                  corrida.status === 'atribuída' ? 'bg-blue-100 text-blue-800' :
                  corrida.status === 'coletando' ? 'bg-blue-100 text-blue-800' :
                  corrida.status === 'transportando' ? 'bg-indigo-100 text-indigo-800' :
                  corrida.status === 'entregando' ? 'bg-purple-100 text-purple-800' :
                  corrida.status === 'finalizada' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  <span className={`w-3 h-3 rounded-full ${corrida.status === 'pendente' ? 'bg-yellow-500' : 
                  corrida.status === 'atribuída' ? 'bg-blue-500' : 
                  corrida.status === 'coletando' ? 'bg-blue-600' : 
                  corrida.status === 'transportando' ? 'bg-indigo-500' : 
                  corrida.status === 'entregando' ? 'bg-purple-500' : 
                  corrida.status === 'finalizada' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  {corrida.status.toUpperCase()}
                </p>
              </div>
              
              <div className="col-span-4 flex flex-col items-end justify-center">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {new Date(corrida.created_at || '').toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric'})}
                  </span>
                </div>
                {corrida.valor && (
                  <div className="font-bold text-lg mt-1 text-primary flex items-center gap-1">
                    <span className="text-sm font-normal text-muted-foreground">Valor:</span>
                    R$ {corrida.valor.toFixed(2).replace('.', ',')}
                  </div>
                )}
              </div>
            </div>
            
            {/* Progresso da corrida */}
            <div className="mt-3 pt-3 border-t">
              <div className="relative">
                <div className="grid grid-cols-6 mb-1 text-[10px] font-medium text-muted-foreground">
                  <span>Solicitada</span>
                  <span>Atribuída</span>
                  <span>Coletando</span>
                  <span>Transportando</span>
                  <span>Entregando</span>
                  <span>Finalizada</span>
                </div>
                <div className="w-full bg-muted h-3 rounded-full">
                  <div 
                    className={`h-3 rounded-full ${
                      corrida.status === 'pendente' ? 'bg-yellow-400 w-[8%]' : 
                      corrida.status === 'atribuída' ? 'bg-blue-400 w-[25%]' : 
                      corrida.status === 'coletando' ? 'bg-blue-500 w-[41%]' : 
                      corrida.status === 'transportando' ? 'bg-indigo-500 w-[58%]' : 
                      corrida.status === 'entregando' ? 'bg-purple-500 w-[75%]' : 
                      corrida.status === 'finalizada' ? 'bg-green-500 w-full' : 
                      'bg-red-400 w-[8%]'
                    }`} 
                  />
                </div>
                
                {/* Status indicators */}
                <div className="grid grid-cols-6 mt-2">
                  <div className="flex justify-center">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      corrida.status === 'pendente' || 
                      corrida.status === 'atribuída' || 
                      corrida.status === 'coletando' || 
                      corrida.status === 'transportando' || 
                      corrida.status === 'entregando' || 
                      corrida.status === 'finalizada' ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {(corrida.status === 'pendente' || 
                        corrida.status === 'atribuída' || 
                        corrida.status === 'coletando' || 
                        corrida.status === 'transportando' || 
                        corrida.status === 'entregando' || 
                        corrida.status === 'finalizada') && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      corrida.status === 'atribuída' || 
                      corrida.status === 'coletando' || 
                      corrida.status === 'transportando' || 
                      corrida.status === 'entregando' || 
                      corrida.status === 'finalizada' ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {(corrida.status === 'atribuída' || 
                        corrida.status === 'coletando' || 
                        corrida.status === 'transportando' || 
                        corrida.status === 'entregando' || 
                        corrida.status === 'finalizada') && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      corrida.status === 'coletando' || 
                      corrida.status === 'transportando' || 
                      corrida.status === 'entregando' || 
                      corrida.status === 'finalizada' ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {(corrida.status === 'coletando' || 
                        corrida.status === 'transportando' || 
                        corrida.status === 'entregando' || 
                        corrida.status === 'finalizada') && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      corrida.status === 'transportando' || 
                      corrida.status === 'entregando' || 
                      corrida.status === 'finalizada' ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {(corrida.status === 'transportando' || 
                        corrida.status === 'entregando' || 
                        corrida.status === 'finalizada') && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      corrida.status === 'entregando' || 
                      corrida.status === 'finalizada' ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {(corrida.status === 'entregando' || 
                        corrida.status === 'finalizada') && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      corrida.status === 'finalizada' ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {corrida.status === 'finalizada' && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {/* Informações do Cliente */}
            <Card className="border-l-4 border-l-blue-500 h-full shadow-sm overflow-hidden">
              <CardContent className="pt-6 px-6 h-full bg-blue-50/30">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-500" />
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
              </CardContent>
            </Card>
            
            {/* Informações do Motorista */}
            <Card className="border-l-4 border-l-orange-500 h-full shadow-sm overflow-hidden">
              <CardContent className="pt-6 px-6 h-full bg-orange-50/30">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Car className="h-5 w-5 text-orange-500" />
                  Informações do Motorista
                </h3>
                {corrida.motorista_nome ? (
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Nome</div>
                      <div className="font-medium">{corrida.motorista_nome}</div>
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
              </CardContent>
            </Card>
            
            {/* Endereços */}
            <Card className="border-l-4 border-l-green-500 shadow-sm overflow-hidden">
              <CardContent className="pt-6 px-6 bg-green-50/20">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-500" />
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
              </CardContent>
            </Card>
            
            {/* Descrição e detalhes da carga */}
            <Card className="border-l-4 border-l-amber-500 shadow-sm overflow-hidden">
              <CardContent className="pt-6 px-6 bg-amber-50/20">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-amber-500" />
                  Detalhes da Carga
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <div className="grid grid-cols-2 gap-2">
                          {corrida.solicitacao.fotos_carga.map((foto, index) => (
                            <div key={index} className="relative aspect-square rounded-md overflow-hidden border bg-muted">
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
              </CardContent>
            </Card>
            
            {/* Informações adicionais e status da entrega */}
            {(corrida.observacoes || corrida.avaliacao || corrida.distancia_km || corrida.fotos_entrega || corrida.status === 'finalizada') && (
              <Card className="border-l-4 border-l-cyan-500 shadow-sm overflow-hidden">
                <CardContent className="pt-6 px-6 bg-cyan-50/20">
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-cyan-500" />
                    {corrida.status === 'finalizada' ? 'Detalhes da Entrega' : 'Informações Adicionais'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CorridaDetailsModal; 