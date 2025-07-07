import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Shield } from 'lucide-react';
import { AdminUserManagement } from './AdminUserManagement';
import { AdminRoleManagement } from './AdminRoleManagement';

interface AdminUserRoleManagementProps {
  companyId: string;
  companyName: string;
}

export const AdminUserRoleManagement = ({ companyId, companyName }: AdminUserRoleManagementProps) => {
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Usuários & Cargos - {companyName}
        </h3>
        <p className="text-sm text-gray-600">
          Gerencie os usuários e cargos desta empresa
        </p>
      </div>
      
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Cargos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <AdminUserManagement companyId={companyId} companyName={companyName} />
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <AdminRoleManagement companyId={companyId} companyName={companyName} />
        </TabsContent>
      </Tabs>
    </div>
  );
};