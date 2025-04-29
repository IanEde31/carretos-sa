/**
 * CorridasList.tsx
 * Componente para renderizar a lista de corridas em tabela e cards responsivos.
 * Responsável apenas pela visualização e interação básica da lista.
 *
 * Props:
 * - corridas: lista de corridas a serem exibidas
 * - loading: estado de carregamento
 * - onSelect: função chamada ao selecionar uma corrida
 * - onAtribuir, onFinalizar, onCancelar: funções para ações de cada corrida
 * - corridaSelecionada: corrida atualmente selecionada
 *
 * Utiliza shadcn/ui, Tailwind e ícones Lucide para UI.
 */
import React from 'react';
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
import { Button } from '@/components/ui/button';
import { Car, CheckCircle, XCircle, MoreHorizontal, User, MapPin } from 'lucide-react';
import { Corrida } from '@/lib/supabase/corridas';

interface CorridasListProps {
  corridas: Corrida[];
  loading: boolean;
  onSelect: (corrida: Corrida) => void;
  onAtribuir: (corrida: Corrida) => void;
  onFinalizar: (corrida: Corrida) => void;
  onCancelar: (corrida: Corrida) => void;
  corridaSelecionada?: Corrida | null;
}

/**
 * Componente de Lista de Corridas
 * @param props CorridasListProps
 */
const CorridasList: React.FC<CorridasListProps> = ({
  corridas,
  loading,
  onSelect,
  onAtribuir,
  onFinalizar,
  onCancelar,
  corridaSelecionada,
}) => {
  return (
    <>
      {/* Tabela para desktop */}
      <div className="hidden md:block">
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
              <TableRow
                key={corrida.id}
                className={`cursor-pointer hover:bg-muted/50 ${corridaSelecionada?.id === corrida.id ? 'bg-muted/30' : ''}`}
                onClick={() => onSelect(corrida)}
              >
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
                      <Button variant="ghost" size="sm" onClick={e => e.stopPropagation()}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={e => { e.stopPropagation(); onAtribuir(corrida); }}
                        disabled={corrida.status !== 'pendente'}
                      >
                        <Car className="mr-2 h-4 w-4" />
                        Atribuir Motorista
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={e => { e.stopPropagation(); onFinalizar(corrida); }}
                        disabled={corrida.status !== 'atribuída'}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Finalizar Corrida
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={e => { e.stopPropagation(); onCancelar(corrida); }}
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
        {corridas.length === 0 && !loading && (
          <div className="bg-card rounded-lg p-4 shadow-sm text-center mt-4">
            <p className="text-muted-foreground">Nenhuma corrida encontrada.</p>
          </div>
        )}
        {loading && (
          <div className="bg-card rounded-lg p-4 shadow-sm text-center mt-4">
            <p className="text-muted-foreground">Carregando corridas...</p>
          </div>
        )}
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
          <div
            key={corrida.id}
            className={`bg-card rounded-lg p-4 shadow-sm cursor-pointer hover:bg-muted/50 ${corridaSelecionada?.id === corrida.id ? 'bg-muted/30' : ''}`}
            onClick={() => onSelect(corrida)}
          >
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
                    onClick={() => onAtribuir(corrida)}
                    disabled={corrida.status !== 'pendente'}
                  >
                    <Car className="mr-2 h-4 w-4" />
                    Atribuir Motorista
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onFinalizar(corrida)}
                    disabled={corrida.status !== 'atribuída'}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Finalizar Corrida
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onCancelar(corrida)}
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
    </>
  );
};

export default CorridasList;
