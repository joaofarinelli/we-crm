
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminCompanies } from '@/hooks/useAdminCompanies';
import { useSaasProfiles } from '@/hooks/useSaasProfiles';
import { useRoles } from '@/hooks/useRoles';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

const companySchema = z.object({
  name: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres'),
  domain: z.string().optional(),
  industry: z.string().optional(),
  size: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url('Digite uma URL válida').optional().or(z.literal('')),
  phone: z.string().optional(),
  plan: z.string().optional(),
  status: z.string().optional(),
  // Campos para criar administrador
  createAdmin: z.boolean().optional(),
  adminEmail: z.string().email('Email inválido').optional(),
  adminName: z.string().optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface CompanyData {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  size: string | null;
  location: string | null;
  website: string | null;
  phone: string | null;
  plan: string | null;
  status: string | null;
}

interface CompanyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: CompanyData | null;
  onSuccess: () => void;
}

export const CompanyFormDialog = ({ 
  open, 
  onOpenChange, 
  company, 
  onSuccess 
}: CompanyFormDialogProps) => {
  const { createCompany, updateCompany, loading } = useAdminCompanies();
  const { createUserInvitation } = useSaasProfiles();
  const { roles } = useRoles();
  const isEditing = !!company;

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      domain: '',
      industry: '',
      size: '',
      location: '',
      website: '',
      phone: '',
      plan: 'basic',
      status: 'Prospect',
      createAdmin: false,
      adminEmail: '',
      adminName: '',
    },
  });

  useEffect(() => {
    if (company) {
      form.reset({
        name: company.name || '',
        domain: company.domain || '',
        industry: company.industry || '',
        size: company.size || '',
        location: company.location || '',
        website: company.website || '',
        phone: company.phone || '',
        plan: company.plan || 'basic',
        status: company.status || 'Prospect',
        createAdmin: false,
        adminEmail: '',
        adminName: '',
      });
    } else {
      form.reset({
        name: '',
        domain: '',
        industry: '',
        size: '',
        location: '',
        website: '',
        phone: '',
        plan: 'basic',
        status: 'Prospect',
        createAdmin: false,
        adminEmail: '',
        adminName: '',
      });
    }
  }, [company, form]);

  const onSubmit = async (data: CompanyFormData) => {
    let success = false;
    let newCompanyId: string | null = null;
    
    if (isEditing && company) {
      success = await updateCompany({
        id: company.id,
        ...data,
      });
    } else {
      const result = await createCompany(data);
      success = !!result;
      newCompanyId = result;
    }

    if (success) {
      // Se criar admin foi solicitado e é uma nova empresa
      if (data.createAdmin && !isEditing && newCompanyId && data.adminEmail) {
        try {
          // Buscar role de Admin para a empresa
          const adminRole = roles.find(role => role.name === 'Admin');
          if (adminRole) {
            await createUserInvitation(data.adminEmail, newCompanyId, adminRole.id);
          }
        } catch (error) {
          console.error('Erro ao criar convite para admin:', error);
        }
      }
      
      form.reset();
      onOpenChange(false);
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Empresa' : 'Adicionar Nova Empresa'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Atualize os dados da empresa' 
              : 'Preencha os dados para adicionar uma nova empresa'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Empresa *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Minha Empresa LTDA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="domain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domínio</FormLabel>
                    <FormControl>
                      <Input placeholder="empresa.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Setor</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o setor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="tecnologia">Tecnologia</SelectItem>
                        <SelectItem value="saude">Saúde</SelectItem>
                        <SelectItem value="educacao">Educação</SelectItem>
                        <SelectItem value="financeiro">Financeiro</SelectItem>
                        <SelectItem value="varejo">Varejo</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                        <SelectItem value="servicos">Serviços</SelectItem>
                        <SelectItem value="construcao">Construção</SelectItem>
                        <SelectItem value="agronegocio">Agronegócio</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tamanho</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Número de funcionários" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 funcionários</SelectItem>
                        <SelectItem value="11-50">11-50 funcionários</SelectItem>
                        <SelectItem value="51-200">51-200 funcionários</SelectItem>
                        <SelectItem value="201-500">201-500 funcionários</SelectItem>
                        <SelectItem value="501-1000">501-1000 funcionários</SelectItem>
                        <SelectItem value="1000+">Mais de 1000 funcionários</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localização</FormLabel>
                    <FormControl>
                      <Input placeholder="São Paulo, SP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://www.empresa.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="plan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plano</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o plano" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Prospect">Prospect</SelectItem>
                        <SelectItem value="Ativa">Ativa</SelectItem>
                        <SelectItem value="Inativa">Inativa</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {!isEditing && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <FormField
                      control={form.control}
                      name="createAdmin"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Criar usuário administrador para esta empresa
                            </FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Um convite será enviado por email para o administrador
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  {form.watch('createAdmin') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                      <FormField
                        control={form.control}
                        name="adminEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email do Administrador *</FormLabel>
                            <FormControl>
                              <Input placeholder="admin@empresa.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="adminName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Administrador</FormLabel>
                            <FormControl>
                              <Input placeholder="João Silva" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading 
                  ? (isEditing ? 'Atualizando...' : 'Criando...') 
                  : (isEditing ? 'Atualizar Empresa' : 'Criar Empresa')
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
