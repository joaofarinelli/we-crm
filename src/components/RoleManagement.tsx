
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useRoles } from '@/hooks/useRoles';
import { useCompanyRolePermissions } from '@/hooks/useCompanyRolePermissions';
import { Shield, Settings } from 'lucide-react';
import { RolePermissionsDialog } from './settings/RolePermissionsDialog';

export const RoleManagement = () => {
  const { roles, loading } = useRoles();
  const { updateRolePermissions, getRolePermissions } = useCompanyRolePermissions();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleEditPermissions = (role: any) => {
    setSelectedRole(role);
    setDialogOpen(true);
  };

  const handleSavePermissions = async (roleId: string, permissions: any) => {
    try {
      await updateRolePermissions(roleId, permissions);
      toast({
        title: "Sucesso",
        description: "Permissões atualizadas com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro", 
        description: "Erro ao atualizar permissões",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="p-6">Carregando cargos...</div>;
  }

  // Agora roles contém apenas os roles do sistema
  const systemRoles = roles;

  const getPermissionsSummary = (role: any) => {
    const customPermissions = getRolePermissions(role.id);
    
    if (!customPermissions) {
      return 'Permissões padrão';
    }
    
    let totalPermissions = 0;
    let enabledPermissions = 0;
    
    Object.values(customPermissions).forEach((category: any) => {
      Object.values(category).forEach((permission: any) => {
        totalPermissions++;
        if (permission === true) {
          enabledPermissions++;
        }
      });
    });
    
    return `${enabledPermissions}/${totalPermissions} permissões`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Cargos do Sistema</h1>
          <p className="text-gray-600">Gerencie os cargos e suas permissões para sua empresa</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {systemRoles.map((role) => (
          <Card key={role.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{role.name}</CardTitle>
                  <Badge variant="secondary" className="mt-1">
                    Sistema
                  </Badge>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditPermissions(role)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-2">
              <CardDescription>{role.description || 'Sem descrição'}</CardDescription>
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3 text-gray-400" />
                <Badge variant="outline" className="text-xs">
                  {getPermissionsSummary(role)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {systemRoles.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-gray-500 text-lg">Nenhum cargo do sistema encontrado</p>
          <p className="text-gray-400 mt-2">Entre em contato com o administrador</p>
        </Card>
      )}

      <RolePermissionsDialog
        role={selectedRole}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSavePermissions}
        getRolePermissions={getRolePermissions}
      />
    </div>
  );
};
