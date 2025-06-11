
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Building2, 
  Users, 
  Shield, 
  Settings as SettingsIcon, 
  CreditCard, 
  Plug,
  Bell,
  FileText
} from 'lucide-react';
import { CompanyInfoSettings } from './settings/CompanyInfoSettings';
import { NotificationSettings } from './settings/NotificationSettings';
import { SystemSettings } from './settings/SystemSettings';
import { UserManagement } from './UserManagement';
import { RoleManagement } from './RoleManagement';

export const Settings = () => {
  const [activeTab, setActiveTab] = useState('company');

  const tabs = [
    {
      id: 'company',
      label: 'Empresa',
      icon: Building2,
      component: CompanyInfoSettings,
    },
    {
      id: 'users',
      label: 'Usuários',
      icon: Users,
      component: UserManagement,
    },
    {
      id: 'roles',
      label: 'Cargos',
      icon: Shield,
      component: RoleManagement,
    },
    {
      id: 'notifications',
      label: 'Notificações',
      icon: Bell,
      component: NotificationSettings,
    },
    {
      id: 'system',
      label: 'Sistema',
      icon: SettingsIcon,
      component: SystemSettings,
    },
    {
      id: 'billing',
      label: 'Plano',
      icon: CreditCard,
      component: () => (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Configurações de Plano</h3>
              <p className="text-gray-500">Em desenvolvimento</p>
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      id: 'integrations',
      label: 'Integrações',
      icon: Plug,
      component: () => (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Plug className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Integrações</h3>
              <p className="text-gray-500">Em desenvolvimento</p>
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      id: 'audit',
      label: 'Auditoria',
      icon: FileText,
      component: () => (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Logs de Auditoria</h3>
              <p className="text-gray-500">Em desenvolvimento</p>
            </div>
          </CardContent>
        </Card>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-2">
          Gerencie as configurações da sua empresa e sistema
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className="flex flex-col gap-1 p-3"
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {tabs.map((tab) => {
          const Component = tab.component;
          return (
            <TabsContent key={tab.id} value={tab.id} className="space-y-4">
              <Component />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};
