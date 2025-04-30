'use client';

/**
 * Aba de documentos do formulário de motoristas
 * Permite o upload de CNH, documento de identidade e documento do veículo
 */

import { Upload, X, FileText } from 'lucide-react';
import { FormTabProps } from '../../utils/types';
import { ACCEPTED_DOC_TYPES } from '../../utils/constants';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Componente para upload de documento reutilizável
function DocumentUploader({ 
  id, 
  label, 
  description, 
  onChange, 
  value, 
  rest 
}: { 
  id: string; 
  label: string; 
  description: string; 
  onChange: (file: File | null) => void; 
  value: File | null; 
  rest: any 
}) {
  return (
    <div className="space-y-2">
      <FormLabel>{label}</FormLabel>
      <div 
        className="border-2 border-dashed rounded-md border-muted-foreground/25 overflow-hidden cursor-pointer"
        onClick={() => document.getElementById(id)?.click()}
      >
        {value ? (
          <div className="relative p-4">
            <div className="flex items-center bg-muted/50 p-3 rounded-md">
              <div className="p-1.5 rounded bg-primary/10 mr-3">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div className="text-sm truncate max-w-[240px] flex-1">
                {value.name}
              </div>
            </div>
            
            <div 
              className="absolute top-2 right-2 h-8 w-8 bg-muted-foreground/10 hover:bg-muted-foreground/20 rounded-full flex items-center justify-center cursor-pointer transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
            >
              <X className="h-4 w-4" />
            </div>
          </div>
        ) : (
          <div className="py-10 flex flex-col items-center justify-center hover:bg-muted/30 transition-colors">
            <div className="p-3 rounded-full bg-muted mb-3">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-sm font-medium mb-1">Clique para fazer upload</div>
            <div className="text-xs text-muted-foreground">PDF, JPG, PNG (máx. 5MB)</div>
          </div>
        )}
      </div>
      
      <Input
        id={id}
        type="file"
        accept={ACCEPTED_DOC_TYPES.join(', ')}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onChange(file);
        }}
        {...rest}
      />
      
      <FormDescription>
        {description}
      </FormDescription>
    </div>
  );
}

export function DocumentsTab({ form }: FormTabProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          Documentos
        </CardTitle>
        <CardDescription>
          Documentos obrigatórios para cadastro do motorista
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload de CNH */}
        <FormField
          control={form.control}
          name="doc_cnh"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem>
              <FormControl>
                <DocumentUploader 
                  id="doc_cnh_input"
                  label="CNH"
                  description="Carteira Nacional de Habilitação válida"
                  onChange={onChange}
                  value={value}
                  rest={rest}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Upload de Documento de Identidade (Frente) */}
        <FormField
          control={form.control}
          name="doc_identidade_frente"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem>
              <FormControl>
                <DocumentUploader 
                  id="doc_identidade_frente_input"
                  label="Documento de Identidade (Frente)"
                  description="Frente do RG ou outro documento com foto"
                  onChange={onChange}
                  value={value}
                  rest={rest}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Upload de Documento de Identidade (Verso) */}
        <FormField
          control={form.control}
          name="doc_identidade_verso"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem>
              <FormControl>
                <DocumentUploader 
                  id="doc_identidade_verso_input"
                  label="Documento de Identidade (Verso)"
                  description="Verso do RG ou outro documento com foto"
                  onChange={onChange}
                  value={value}
                  rest={rest}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Upload de Documento do Veículo */}
        <FormField
          control={form.control}
          name="doc_veiculo"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem>
              <FormControl>
                <DocumentUploader 
                  id="doc_veiculo_input"
                  label="Documento do Veículo"
                  description="Documento de propriedade ou aluguel do veículo"
                  onChange={onChange}
                  value={value}
                  rest={rest}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
