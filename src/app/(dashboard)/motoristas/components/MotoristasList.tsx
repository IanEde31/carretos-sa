/**
 * Componente que exibe a lista de motoristas em formato de tabela
 * Com funcionalidades de visualização, alteração de status e exclusão
 */

import { Search, Filter, Info } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MotoristasListProps } from '../utils/types';

export function MotoristasList({ 
  motoristas, 
  isLoading, 
  onViewDetails, 
  onStatusChange, 
  onDelete 
}: MotoristasListProps) {
  return (
    <div className="space-y-4">
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
                <TableRow 
                  key={motorista.id} 
                  className="cursor-pointer hover:bg-muted/50" 
                  onClick={() => onViewDetails(motorista)}
                >
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
                    <Button variant="ghost" size="sm" onClick={(e) => {
                      e.stopPropagation(); // Evita que o clique propague para a linha
                      onStatusChange(motorista.id!, motorista.status === 'ativo' ? 'inativo' : 'ativo');
                    }}>
                      {motorista.status === 'ativo' ? 'Inativar' : 'Ativar'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => {
                      e.stopPropagation(); // Evita que o clique propague para a linha
                      onDelete(motorista.id!);
                    }}>
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
            <div 
              key={motorista.id} 
              className="bg-card rounded-lg p-4 shadow-sm cursor-pointer hover:bg-muted/50"
              onClick={() => onViewDetails(motorista)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">{motorista.nome}</div>
                <div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      motorista.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {motorista.status}
                  </span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>ID: {motorista.id?.substring(0, 8)}</div>
                <div>Email: {motorista.email}</div>
                <div>Telefone: {motorista.telefone}</div>
                <div>Veículo: {motorista.veiculo?.tipo}</div>
                <div>Cadastro: {new Date(motorista.created_at || '').toLocaleDateString('pt-BR')}</div>
              </div>
              <div className="flex justify-between items-center mt-3">
                <Button variant="outline" size="sm" className="text-primary">
                  <Info className="h-4 w-4 mr-1" /> Detalhes
                </Button>
                <div>
                  <Button variant="ghost" size="sm" onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(motorista.id!, motorista.status === 'ativo' ? 'inativo' : 'ativo');
                  }}>
                    {motorista.status === 'ativo' ? 'Inativar' : 'Ativar'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={(e) => {
                    e.stopPropagation();
                    onDelete(motorista.id!);
                  }}>
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}