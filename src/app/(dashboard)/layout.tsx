import { Metadata } from 'next';
import { Sidebar } from '@/components/layout/sidebar';
import '@/app/globals.css';
import { Header } from '@/components/layout/header';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Carretos.sa - Painel Administrativo',
  description: 'Plataforma de gerenciamento de carretos',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 w-full">{children}</main>
        <Toaster />
      </div>
    </div>
  );
}
