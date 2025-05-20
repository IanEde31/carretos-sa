'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Car, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  UserCircle, 
  X,
  Package
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // Redirecionar para página de login
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Função para verificar se o link está ativo
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  const navItems = [
    { 
      name: 'Dashboard', 
      href: '/home', 
      icon: <LayoutDashboard className="h-5 w-5" /> 
    },
    { 
      name: 'Corridas', 
      href: '/corridas', 
      icon: <Package className="h-5 w-5" /> 
    },
    { 
      name: 'Motoristas', 
      href: '/motoristas', 
      icon: <Car className="h-5 w-5" /> 
    },
    { 
      name: 'Perfil', 
      href: '/perfil', 
      icon: <UserCircle className="h-5 w-5" /> 
    }
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="flex items-center justify-between p-4 border-b lg:hidden">
        <div className="flex items-center">
          <Image src="/LogoPNG.png" alt="FreteFácil Brasil" width={120} height={40} className="h-8 w-auto" />
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleMobileMenu}
          className="lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow border-r bg-white dark:bg-gray-950 pt-5 overflow-y-auto">
          <div className="flex justify-center items-center h-32 px-2 py-6 mb-4">
            <div className="w-full h-full flex items-center justify-center">
              <Image src="/LogoPNG.png" alt="FreteFácil Brasil" width={200} height={80} className="w-full h-auto object-contain" />
            </div>
          </div>
          <nav className="mt-5 flex-1 px-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'bg-gray-100 dark:bg-gray-800 text-primary'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="p-4">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden" onClick={toggleMobileMenu}></div>
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 flex flex-col z-50 w-72 max-w-[80%] bg-white dark:bg-gray-950 shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <Image src="/LogoPNG.png" alt="FreteFácil Brasil" width={120} height={40} className="h-8 w-auto" />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMobileMenu}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        <nav className="flex-1 px-4 mt-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                isActive(item.href)
                  ? 'bg-gray-100 dark:bg-gray-800 text-primary'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </>
  );
}
