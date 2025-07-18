
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Users, 
  Calendar, 
  CalendarDays, 
  CheckSquare, 
  ContactRound, 
  FileText, 
  BarChart3, 
  Settings 
} from 'lucide-react';
import { RolePermissions, DEFAULT_PERMISSIONS, PermissionModule } from '@/types/permissions';

const MODULE_LABELS: Record<PermissionModule, string> = {
  leads: 'Leads',
  appointments: 'Agendamentos',
  meetings: 'Reuniões',
  tasks: 'Tarefas',
  contacts: 'Contatos',
  scripts: 'Scripts',
  partners: 'Parceiros',
  reports: 'Relatórios',
  scheduleBlocks: 'Bloqueios de Agenda',
  admin: 'Administração'
};

const MODULE_ICONS = {
  leads: Users,
  appointments: Calendar,
  meetings: CalendarDays,
  tasks: CheckSquare,
  contacts: ContactRound,
  scripts: FileText,
  partners: Users,
  reports: BarChart3,
  scheduleBlocks: Calendar,
  admin: Settings
};

const ACTION_LABELS = {
  view: 'Visualizar',
  create: 'Criar',
  edit: 'Editar',
  delete: 'Excluir',
  assign: 'Atribuir',
  export: 'Exportar',
  import: 'Importar',
  viewAll: 'Ver Todos',
  moderate: 'Moderar',
  advanced: 'Avançado',
  manageUsers: 'Gerenciar Usuários',
  manageRoles: 'Gerenciar Cargos',
  companySettings: 'Configurações da Empresa',
  systemSettings: 'Configurações do Sistema'
};

interface RolePermissionsDialogProps {
  role: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (roleId: string, permissions: RolePermissions) => Promise<void>;
  getRolePermissions: (roleId: string) => RolePermissions | null;
}

export const RolePermissionsDialog: React.FC<RolePermissionsDialogProps> = ({
  role,
  open,
  onOpenChange,
  onSave,
  getRolePermissions
}) => {
  const [localPermissions, setLocalPermissions] = useState<RolePermissions | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (role) {
      const currentPerms = getRolePermissions(role.id);
      const defaultPerms = DEFAULT_PERMISSIONS[role.name] || DEFAULT_PERMISSIONS['SDR'];
      setLocalPermissions(currentPerms || defaultPerms);
      setHasChanges(false);
    }
  }, [role, getRolePermissions]);

  const updatePermission = (module: PermissionModule, action: string, value: boolean) => {
    if (!localPermissions) return;
    
    const newPerms = {
      ...localPermissions,
      [module]: {
        ...localPermissions[module],
        [action]: value
      }
    };
    
    setLocalPermissions(newPerms);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (localPermissions && role) {
      await onSave(role.id, localPermissions);
      setHasChanges(false);
      onOpenChange(false);
    }
  };

  const resetToDefaults = () => {
    if (role && DEFAULT_PERMISSIONS[role.name]) {
      setLocalPermissions(DEFAULT_PERMISSIONS[role.name]);
      setHasChanges(true);
    }
  };

  const getPermissionCount = (): { total: number, enabled: number } => {
    if (!localPermissions) return { total: 0, enabled: 0 };
    
    let total = 0;
    let enabled = 0;

    Object.entries(localPermissions).forEach(([, modulePerms]) => {
      Object.entries(modulePerms).forEach(([, value]) => {
        total++;
        if (value) enabled++;
      });
    });

    return { total, enabled };
  };

  if (!role || !localPermissions) return null;

  const { total, enabled } = getPermissionCount();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurar Permissões - {role.name}
          </DialogTitle>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {enabled} de {total} permissões habilitadas
            </p>
            
            {hasChanges && (
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                Alterações não salvas
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {Object.entries(MODULE_LABELS).map(([module, label]) => {
            const modulePerms = localPermissions[module as PermissionModule];
            const IconComponent = MODULE_ICONS[module as PermissionModule];
            
            return (
              <div key={module} className="space-y-3">
                <div className="flex items-center gap-2">
                  <IconComponent className="w-4 h-4 text-blue-600" />
                  <h4 className="font-medium text-sm">{label}</h4>
                  <Separator className="flex-1" />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(modulePerms).map(([action, value]) => {
                    const actionLabel = ACTION_LABELS[action as keyof typeof ACTION_LABELS];
                    if (!actionLabel) return null;
                    
                    return (
                      <div key={action} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${role.id}-${module}-${action}`}
                          checked={value}
                          onCheckedChange={(checked) => 
                            updatePermission(module as PermissionModule, action, !!checked)
                          }
                        />
                        <label
                          htmlFor={`${role.id}-${module}-${action}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {actionLabel}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
          >
            Restaurar Padrão
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            
            {hasChanges ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button>
                    Salvar Alterações
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Alterações</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja salvar as alterações nas permissões do cargo "{role.name}"? 
                      Esta ação afetará todos os usuários com este cargo.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSave}>
                      Salvar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
