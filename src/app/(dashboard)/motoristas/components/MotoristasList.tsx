/**
 * Componente para exibir a lista de motoristas em formato de tabela
 */

import { useState } from 'react';
import { Search, Filter, Car, Truck, Bike, AlertTriangle } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MotoristaListProps } from '../utils/types';

export function MotoristasList({ 
  motoristas, 
  isLoading, 
  onStatusChange, 
  onDelete, 
  onViewDetails 
}: MotoristaListProps) {
  // Estado para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [tipoVeiculoFilter, setTipoVeiculoFilter] = useState('todos');
  
  // Função para filtrar motoristas
  const filteredMotoristas = motoristas.filter(motorista => {
    // Filtro de pesquisa (nome, email ou telefone)
    const matchesSearch = searchTerm === '' || 
      motorista.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      motorista.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      motorista.telefone.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro de status
    const matchesStatus = statusFilter === 'todos' || motorista.status === statusFilter;
    
    // Filtro de tipo de veículo
    const matchesTipoVeiculo = tipoVeiculoFilter === 'todos' || 
      motorista.veiculo?.tipo === tipoVeiculoFilter;
    
    return matchesSearch && matchesStatus && matchesTipoVeiculo;
  });
  
  // Função para obter o badge de status correto
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800">Ativo</Badge>;
      case 'inativo':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800">Inativo</Badge>;
      case 'ferias':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800">Em férias</Badge>;
      case 'suspenso':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800">Suspenso</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">{status}</Badge>;
    }
  };

  // Função para obter o ícone/nome do tipo de veículo
  const getTipoVeiculo = (tipo: string) => {
    switch (tipo) {
      case 'carro':
        return <div className="flex items-center gap-2"><Car className="h-4 w-4 text-blue-500" /> <span>Carro</span></div>;
      case 'moto':
        return <div className="flex items-center gap-2"><Bike className="h-4 w-4 text-orange-500" /> <span>Moto</span></div>;
      case 'van':
        return <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-purple-500" /> <span>Van</span></div>;
      case 'caminhao_pequeno':
        return <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-indigo-500" /> <span>Caminhão Pequeno</span></div>;
      case 'caminhao_medio':
        return <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-teal-500" /> <span>Caminhão Médio</span></div>;
      case 'caminhao_grande':
        return <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-emerald-500" /> <span>Caminhão Grande</span></div>;
      default:
        return <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-gray-500" /> <span>{tipo || "Não especificado"}</span></div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 min-w-[240px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome, email ou telefone..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 flex-shrink-0" />
                <SelectValue placeholder="Status" className="flex-1 truncate" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
              <SelectItem value="ferias">Em férias</SelectItem>
              <SelectItem value="suspenso">Suspenso</SelectItem>
            </SelectContent>
          </Select>
        
          <Select value={tipoVeiculoFilter} onValueChange={setTipoVeiculoFilter}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 flex-shrink-0" />
                <SelectValue placeholder="Tipo de Veículo" className="flex-1 truncate" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os veículos</SelectItem>
              <SelectItem value="carro">Carro</SelectItem>
              <SelectItem value="moto">Moto</SelectItem>
              <SelectItem value="van">Van</SelectItem>
              <SelectItem value="caminhao_pequeno">Caminhão Pequeno</SelectItem>
              <SelectItem value="caminhao_medio">Caminhão Médio</SelectItem>
              <SelectItem value="caminhao_grande">Caminhão Grande</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Contador de resultados */}
      <div className="text-sm text-muted-foreground">
        {isLoading ? (
          <Skeleton className="h-5 w-40" />
        ) : (
          <>
            {filteredMotoristas.length} 
            {filteredMotoristas.length === 1 ? ' motorista encontrado' : ' motoristas encontrados'}
            {(searchTerm || statusFilter !== 'todos' || tipoVeiculoFilter !== 'todos') && 
              ' com os filtros aplicados'}
          </>
        )}
      </div>
      
      {/* Tabela de motoristas */}
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Nome</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Veículo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Estado de carregamento
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-9 w-20" />
                      <Skeleton className="h-9 w-16" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : filteredMotoristas.length === 0 ? (
              // Sem resultados
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <AlertTriangle className="h-10 w-10 text-muted-foreground/50" />
                    {searchTerm || statusFilter !== 'todos' || tipoVeiculoFilter !== 'todos'
                      ? 'Nenhum motorista encontrado com os filtros aplicados.'
                      : 'Nenhum motorista cadastrado ainda.'}
                    {searchTerm || statusFilter !== 'todos' || tipoVeiculoFilter !== 'todos' ? (
                      <Button 
                        variant="link" 
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('todos');
                          setTipoVeiculoFilter('todos');
                        }}
                        className="mt-2"
                      >
                        Limpar filtros
                      </Button>
                    ) : (
                      <Button 
                        variant="link" 
                        onClick={() => {
                          // Disparar modal de novo motorista via prop
                          // Este botão só seria visível se a lista estiver vazia e sem filtros
                        }}
                        className="mt-2"
                      >
                        Cadastrar primeiro motorista
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // Lista de motoristas
              filteredMotoristas.map((motorista) => (
                <TableRow key={motorista.id} onClick={() => onViewDetails(motorista)} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{motorista.nome}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm">{motorista.email}</span>
                      <span className="text-sm text-muted-foreground">{motorista.telefone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      {getTipoVeiculo(motorista.veiculo?.tipo)}
                      {motorista.veiculo?.descricao && (
                        <span className="text-sm text-muted-foreground truncate max-w-[200px] ml-6">
                          {motorista.veiculo.descricao}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(motorista.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant={motorista.status === 'ativo' ? 'outline' : 'default'}
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(
                            motorista.id!, 
                            motorista.status === 'ativo' ? 'inativo' : 'ativo'
                          );
                        }}
                      >
                        {motorista.status === 'ativo' ? 'Inativar' : 'Ativar'}
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(motorista.id!);
                        }}
                      >
                        Excluir
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}