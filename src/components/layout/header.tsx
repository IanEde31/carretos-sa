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
    <header className="sticky top-0 z-30 w-full border-b bg-white backdrop-blur">
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
        <div className={`${isMobileSearchOpen ? 'flex absolute top-16 left-0 right-0 p-2 bg-white border-b z-50' : 'hidden lg:flex'} lg:w-[400px] header-search`}>
          <div className="relative w-full">
            <LucideSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar..."
              className="w-full pl-8 bg-white border"
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
            <DropdownMenuContent align="end" className="w-80 bg-white border shadow-lg">
              <DropdownMenuLabel>Notificações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                <div className="flex flex-col items-center justify-center p-6 text-gray-500">
                  <span>Sem nada aqui</span>
                </div>
              </div>
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
            <DropdownMenuContent align="end" className="w-56 bg-white border shadow-lg">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start bg-white hover:bg-gray-50">
                <span className="font-medium">{currentUser.nome}</span>
                <span className="text-xs text-gray-500">{currentUser.email}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="bg-white hover:bg-gray-50" onClick={() => router.push('/perfil')}>Perfil</DropdownMenuItem>
              <DropdownMenuItem className="bg-white hover:bg-gray-50" onClick={() => router.push('/configuracoes')}>Configurações</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="bg-white hover:bg-gray-50" onClick={() => router.push('/login')}>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
