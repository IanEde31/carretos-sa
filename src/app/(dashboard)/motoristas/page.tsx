'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { type Motorista, type MotoristaFormData } from '@/lib/supabase/motoristas';

// Componentes refatorados
import { MotoristasList } from './components/MotoristasList';
import { MotoristaModal } from './components/MotoristaModal';
import { MotoristaDetailsModal } from './components/MotoristaDetailsModal';

// Hooks personalizados
import { useMotoristas } from './hooks/useMotoristas';

export default function MotoristasPage() {
  // Estado do modal de novo motorista
  const [newMotoristaModalOpen, setNewMotoristaModalOpen] = useState(false);
  
  // Estado do modal de detalhes do motorista
  const [selectedMotorista, setSelectedMotorista] = useState<Motorista | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  
  // Utilizando o hook personalizado para gerenciar os motoristas
  const { 
    motoristas, 
    isLoading, 
    handleCreate, 
    handleStatusChange, 
    handleDelete 
  } = useMotoristas();
  
  // Função para abrir o modal de detalhes do motorista
  const handleViewDetails = (motorista: Motorista) => {
    setSelectedMotorista(motorista);
    setDetailsModalOpen(true);
  };
  
  // Função para lidar com o envio do formulário de novo motorista
  const onSubmit = async (data: MotoristaFormData) => {
    try {
      await handleCreate(data);
      setNewMotoristaModalOpen(false);
      toast({
        title: "Motorista cadastrado com sucesso",
        description: `O motorista ${data.nome} foi cadastrado.`,
      });
    } catch (error) {
      console.error("Erro ao cadastrar motorista:", error);
      toast({
        title: "Erro ao cadastrar motorista",
        description: "Ocorreu um erro ao cadastrar o motorista. Tente novamente.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="max-w-screen-2xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Cabeçalho da página */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg mb-8 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Motoristas</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie os motoristas cadastrados no sistema
            </p>
          </div>
          
          <Button 
            size="default"
            className="flex items-center gap-2 shadow-sm hover:shadow transition-all"
            onClick={() => setNewMotoristaModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo Motorista</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>
      </div>
      
      {/* Conteúdo principal */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-5">
        {/* Lista de motoristas refatorada */}
        <MotoristasList
          motoristas={motoristas}
          isLoading={isLoading}
          onViewDetails={handleViewDetails}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      </div>
      
      {/* Modais */}
      <MotoristaModal
        open={newMotoristaModalOpen}
        onOpenChange={setNewMotoristaModalOpen}
        onSubmit={onSubmit}
      />
      
      <MotoristaDetailsModal
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        motorista={selectedMotorista}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}