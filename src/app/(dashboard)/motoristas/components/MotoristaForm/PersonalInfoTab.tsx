'use client';

/**
 * Aba de informações pessoais do formulário de motoristas
 */

import { Camera, X, User } from 'lucide-react';
import Image from 'next/image';
import { FormTabProps } from '../../utils/types';
import { ACCEPTED_IMAGE_TYPES } from '../../utils/constants';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage, 
  FormDescription 
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function PersonalInfoTab({ form }: FormTabProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <User className="h-5 w-5 text-muted-foreground" />
          Dados Pessoais
        </CardTitle>
        <CardDescription>
          Dados básicos e identificação do motorista
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center justify-center mb-4">
          <FormField
            control={form.control}
            name="foto_perfil"
            render={({ field: { onChange, value, ...rest } }) => (
              <FormItem className="text-center w-full">
                {/* Container da foto com área clicável */}
                <div className="relative w-32 h-32 mx-auto cursor-pointer">
                  <div 
                    className="relative w-full h-full rounded-full overflow-hidden bg-muted flex items-center justify-center border-2 border-dashed border-primary/40 hover:border-primary transition-colors"
                    onClick={() => document.getElementById('foto_upload')?.click()}
                  >
                    {form.watch('foto_perfil') ? (
                      <>
                        <Image
                          src={URL.createObjectURL(form.watch('foto_perfil') as Blob)}
                          alt="Foto de perfil"
                          className="object-cover rounded-full"
                          fill
                          sizes="128px"
                        />
                        <div 
                          className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            form.setValue('foto_perfil', null);
                          }}
                        >
                          <X className="h-6 w-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-2">
                        <Camera className="h-10 w-10 text-muted-foreground mb-1" />
                        <span className="text-xs text-muted-foreground">Clique para<br />adicionar foto</span>
                      </div>
                    )}
                  </div>
                  
                  <Input
                    id="foto_upload"
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES.join(', ')}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onChange(file);
                    }}
                    {...rest}
                  />
                </div>
                
                <FormMessage />
                <FormDescription className="text-xs">
                  Foto JPG, PNG ou WEBP (máx. 5MB)
                </FormDescription>
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@exemplo.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="telefone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input placeholder="(00) 00000-0000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF</FormLabel>
                <FormControl>
                  <Input placeholder="000.000.000-00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="rg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RG</FormLabel>
                <FormControl>
                  <Input placeholder="00.000.000-0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="area_atuacao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Área de Atuação</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: São Paulo, Zona Sul" {...field} />
                </FormControl>
                <FormMessage />
                <FormDescription>
                  Região onde o motorista trabalha
                </FormDescription>
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="ferias">Em férias</SelectItem>
                  <SelectItem value="suspenso">Suspenso</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
