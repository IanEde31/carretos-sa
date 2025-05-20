'use client';

/**
 * Modal para exibir detalhes de um motorista
 * Exibe todas as informações detalhadas, incluindo documentos e foto
 */

import Image from 'next/image';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Truck, 
  Car, 
  Info 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MotoristaDetailsModalProps } from '../utils/types';

export function MotoristaDetailsModal({ 
  open, 
  onOpenChange, 
  motorista, 
  onStatusChange 
}: MotoristaDetailsModalProps) {
  
  /**
   * Obtém ícone e descrição do tipo de veículo
   */
  const getTipoVeiculo = (tipo?: string) => {
    switch (tipo) {
      case 'carro':
        return { icon: <Car className="h-5 w-5" />, label: 'Carro' };
      case 'moto':
        return { icon: <Car className="h-5 w-5" />, label: 'Moto' };
      case 'van':
        return { icon: <Truck className="h-5 w-5" />, label: 'Van' };
      case 'caminhao_pequeno':
        return { icon: <Truck className="h-5 w-5" />, label: 'Caminhão Pequeno' };
      case 'caminhao_medio':
        return { icon: <Truck className="h-5 w-5" />, label: 'Caminhão Médio' };
      case 'caminhao_grande':
        return { icon: <Truck className="h-5 w-5" />, label: 'Caminhão Grande' };
      default:
        return { icon: <Car className="h-5 w-5" />, label: tipo || 'Não informado' };
    }
  };

  /**
   * Formata a data para exibição
   */
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não informado';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Se não houver motorista selecionado, não exibir nada
  if (!motorista) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Detalhes do Motorista</DialogTitle>
          <DialogDescription>
            Informações completas sobre o motorista selecionado
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {motorista && (
            <>
              <div className="flex flex-col md:flex-row gap-6">
                {/* Foto do motorista */}
                <div className="flex-shrink-0">
                  <div className="w-28 h-28 rounded-full overflow-hidden bg-muted flex items-center justify-center border">
                    {motorista.foto_perfil ? (
                      <Image 
                        src={motorista.foto_perfil} 
                        alt="Foto de perfil" 
                        width={112} 
                        height={112} 
                        className="object-cover" 
                      />
                    ) : (
                      <User className="h-12 w-12 text-muted-foreground/70" />
                    )}
                  </div>
                </div>
                
                {/* Informações principais */}
                <div className="flex-grow">
                  <h2 className="text-2xl font-bold">{motorista.nome}</h2>
                  <div className="text-md text-muted-foreground mb-4">
                    {getStatusBadge(motorista.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{motorista.email}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{motorista.telefone}</span>
                    </div>
                    
                    {motorista.data_cadastro && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Cadastrado em {formatDate(motorista.data_cadastro)}</span>
                      </div>
                    )}
                    
                    {motorista.area_atuacao && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{motorista.area_atuacao}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Informações do veículo */}
              <div className="border rounded-md p-4">
                <h3 className="text-lg font-medium mb-3">Informações do Veículo</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    {getTipoVeiculo(motorista.veiculo?.tipo).icon}
                    <div>
                      <h4 className="font-medium text-sm">Tipo de Veículo</h4>
                      <p>
                        {getTipoVeiculo(motorista.veiculo?.tipo).label}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5" />
                    <div>
                      <h4 className="font-medium text-sm">Descrição</h4>
                      <p>
                        {motorista.veiculo?.descricao || 'Não informado'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5" />
                    <div>
                      <h4 className="font-medium text-sm">Placa</h4>
                      <p>
                        {motorista.placa_veiculo || 'Não informado'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {motorista.capacidade_carga && (
                  <div className="border-t pt-4 mt-4">
                    <div>
                      <h4 className="font-medium text-sm">Capacidade de Carga</h4>
                      <p className="text-sm">
                        {motorista.capacidade_carga} kg
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Documentos */}
              {(motorista.documentos?.cnh || motorista.documentos?.identidade || motorista.documentos?.documento_veiculo) && (
                <div className="border rounded-md p-4">
                  <h3 className="text-lg font-medium mb-3">Documentos</h3>
                  
                  <div className="flex gap-4 flex-wrap">
                    {motorista.documentos?.cnh && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">CNH</h4>
                        <Button variant="outline" size="sm" onClick={() => window.open(motorista.documentos?.cnh, '_blank')}>
                          Visualizar Documento
                        </Button>
                      </div>
                    )}
                    
                    {motorista.documentos?.identidade && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Identidade</h4>
                        <Button variant="outline" size="sm" onClick={() => window.open(motorista.documentos?.identidade, '_blank')}>
                          Visualizar Documento
                        </Button>
                      </div>
                    )}
                    
                    {motorista.documentos?.documento_veiculo && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Documento do Veículo</h4>
                        <Button variant="outline" size="sm" onClick={() => window.open(motorista.documentos?.documento_veiculo, '_blank')}>
                          Visualizar Documento
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Rodapé com ações */}
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          
          {motorista && (
            <div className="space-x-2">
              <Button 
                variant={motorista.status === 'ativo' ? 'destructive' : 'default'}
                onClick={() => {
                  onStatusChange(motorista.id!, motorista.status === 'ativo' ? 'inativo' : 'ativo');
                  onOpenChange(false);
                }}
              >
                {motorista.status === 'ativo' ? 'Inativar Motorista' : 'Ativar Motorista'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Renderiza o badge de status
 */
function getStatusBadge(status: string) {
  switch (status) {
    case 'ativo':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Ativo</span>;
    case 'inativo':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Inativo</span>;
    case 'ferias':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Em férias</span>;
    case 'suspenso':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Suspenso</span>;
    default:
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
  }
}
