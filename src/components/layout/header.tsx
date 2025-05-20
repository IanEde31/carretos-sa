'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LucideBell, LucideSearch } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { mockTeamMembers } from '@/data/mockData';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function Header() {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const router = useRouter();
  
  // Usando o primeiro membro da equipe como usuário atual (para demonstração)
  const currentUser = mockTeamMembers[0];
  
  // Obter iniciais para o Avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Parte esquerda - Botão de pesquisa em mobile */}
        <div className="flex items-center lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="mr-2"
          >
            <LucideSearch className="h-5 w-5" />
            <span className="sr-only">Pesquisar</span>
          </Button>
        </div>

        {/* Barra de pesquisa - Visível em desktop ou quando aberta em mobile */}
        <div className={`${isMobileSearchOpen ? 'flex absolute top-16 left-0 right-0 p-2 bg-background border-b z-50' : 'hidden lg:flex'} lg:w-[400px]`}>
          <div className="relative w-full">
            <LucideSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar..."
              className="w-full pl-8 bg-background"
            />
          </div>
        </div>

        {/* Parte direita - Botões e menu do usuário */}
        <div className="flex items-center gap-2">
          <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <LucideBell className="h-5 w-5" />
                <span className="sr-only">Notificações</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notificações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                <DropdownMenuItem className="flex flex-col items-start p-3">
                  <span className="font-medium">Nova corrida disponível</span>
                  <span className="text-xs text-muted-foreground mt-1">Há 5 minutos atrás</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start p-3">
                  <span className="font-medium">Motorista aceitou corrida #123</span>
                  <span className="text-xs text-muted-foreground mt-1">Há 30 minutos atrás</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start p-3">
                  <span className="font-medium">Corrida #120 finalizada</span>
                  <span className="text-xs text-muted-foreground mt-1">Hoje, 14:30</span>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center font-medium text-primary">
                Ver todas as notificações
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.foto_url} alt={currentUser.nome} />
                  <AvatarFallback>{getInitials(currentUser.nome)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start">
                <span className="font-medium">{currentUser.nome}</span>
                <span className="text-xs text-muted-foreground">{currentUser.email}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/perfil')}>Perfil</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/configuracoes')}>Configurações</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/login')}>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
