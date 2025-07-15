import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Search, Edit2, Trash2, Mail, Building2, Shield, UserCheck } from 'lucide-react';
import { useSaasProfiles } from '@/hooks/useSaasProfiles';
import { useAllCompanies } from '@/hooks/useAllCompanies';
import { useRoles } from '@/hooks/useRoles';
import { CreateUserDialog } from './CreateUserDialog';
import { EditUserDialog } from './EditUserDialog';
import { TransferUserDialog } from './TransferUserDialog';

export const SaasUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [editingUser, setEditingUser] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferUser, setTransferUser] = useState(null);

  const { profiles, loading, deleteProfile, refetch } = useSaasProfiles();
  const { companies } = useAllCompanies();
  const { roles } = useRoles();

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = !searchTerm || 
      profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCompany = selectedCompany === 'all' || profile.company_id === selectedCompany;
    const matchesRole = selectedRole === 'all' || profile.role_id === selectedRole;
    
    return matchesSearch && matchesCompany && matchesRole;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getRoleType = (role: any, isSuperAdmin: boolean) => {
    if (isSuperAdmin) return 'destructive';
    if (!role) return 'default';
    if (role.name === 'Admin') return 'secondary';
    return 'default';
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteProfile(id);
  };

  const handleTransfer = (user: any) => {
    setTransferUser(user);
    setTransferDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                <Shield className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">Gerenciamento de Usuários</span>
              </CardTitle>
              <p className="text-sm sm:text-base text-muted-foreground">
                Gerencie todos os usuários do sistema
              </p>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              <span className="sm:hidden">Novo Usuário</span>
              <span className="hidden sm:inline">Criar Usuário</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por empresa" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all">Todas as empresas</SelectItem>
                  {companies.map(company => (
                    <SelectItem key={company.id} value={company.id}>
                      <span className="truncate">{company.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por cargo" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all">Todos os cargos</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      <span className="truncate">{role.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-2xl font-bold">{profiles.length}</div>
              <div className="text-sm text-muted-foreground">Total de usuários</div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-2xl font-bold">{filteredProfiles.length}</div>
              <div className="text-sm text-muted-foreground">Usuários filtrados</div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-2xl font-bold">
                {profiles.filter(p => p.is_super_admin).length}
              </div>
              <div className="text-sm text-muted-foreground">Super Admins</div>
            </div>
          </div>

          {/* Tabela */}
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Usuário</TableHead>
                  <TableHead className="min-w-[150px]">Empresa</TableHead>
                  <TableHead className="min-w-[120px]">Cargo</TableHead>
                  <TableHead className="min-w-[120px]">Criado em</TableHead>
                  <TableHead className="text-right min-w-[150px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="text-muted-foreground">
                        Nenhum usuário encontrado
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProfiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell>
                        <div className="space-y-1 min-w-0">
                          <div className="font-medium truncate flex items-center gap-2">
                            {profile.full_name || 'Nome não informado'}
                            {profile.is_super_admin && (
                              <Badge variant="destructive" className="text-xs">
                                Super Admin
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1 min-w-0">
                            <Mail className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{profile.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-0">
                          <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{profile.companies?.name || 'Sem empresa'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleType(profile.roles, profile.is_super_admin)}>
                          {profile.is_super_admin ? 'Super Administrador' : (profile.roles?.name || 'Sem cargo')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(profile.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(profile)}
                            className="min-w-0"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTransfer(profile)}
                            className="min-w-0"
                          >
                            <UserCheck className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="min-w-0">
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-w-md">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription className="text-sm">
                                  Tem certeza que deseja excluir o usuário "{profile.full_name || profile.email}"? 
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(profile.id)}>
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={refetch}
      />

      <EditUserDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        user={editingUser}
        onSuccess={refetch}
      />

      <TransferUserDialog
        open={transferDialogOpen}
        onOpenChange={setTransferDialogOpen}
        user={transferUser}
        onSuccess={refetch}
      />
    </div>
  );
};