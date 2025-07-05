
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';
import { useCompanySettings } from '@/hooks/useCompanySettings';

export const NotificationSettings = () => {
  const { company, updateCompany } = useCompanySettings();
  const [settings, setSettings] = useState({
    email: true,
    push: true,
    sms: false,
    leads: true,
    appointments: true,
    tasks: true,
    reports: false,
  });

  useEffect(() => {
    if (company?.notification_settings) {
      setSettings(prev => ({
        ...prev,
        ...company.notification_settings,
      }));
    }
  }, [company]);

  const handleSave = () => {
    updateCompany.mutate({
      notification_settings: {
        email_notifications: settings.email,
        whatsapp_notifications: settings.sms
      }
    });
  };

  const toggleSetting = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Configurações de Notificações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Canais de Notificação */}
        <div>
          <h3 className="text-lg font-medium mb-4">Canais de Notificação</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500" />
                <div>
                  <Label htmlFor="email">Email</Label>
                  <p className="text-sm text-gray-500">Receber notificações por email</p>
                </div>
              </div>
              <Switch
                id="email"
                checked={settings.email}
                onCheckedChange={() => toggleSetting('email')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-green-500" />
                <div>
                  <Label htmlFor="push">Push Notifications</Label>
                  <p className="text-sm text-gray-500">Notificações no navegador</p>
                </div>
              </div>
              <Switch
                id="push"
                checked={settings.push}
                onCheckedChange={() => toggleSetting('push')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-purple-500" />
                <div>
                  <Label htmlFor="sms">SMS</Label>
                  <p className="text-sm text-gray-500">Notificações por mensagem de texto</p>
                </div>
              </div>
              <Switch
                id="sms"
                checked={settings.sms}
                onCheckedChange={() => toggleSetting('sms')}
              />
            </div>
          </div>
        </div>

        {/* Tipos de Notificação */}
        <div>
          <h3 className="text-lg font-medium mb-4">Tipos de Notificação</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="leads">Novos Leads</Label>
                <p className="text-sm text-gray-500">Quando um novo lead é adicionado</p>
              </div>
              <Switch
                id="leads"
                checked={settings.leads}
                onCheckedChange={() => toggleSetting('leads')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="appointments">Agendamentos</Label>
                <p className="text-sm text-gray-500">Lembretes de agendamentos próximos</p>
              </div>
              <Switch
                id="appointments"
                checked={settings.appointments}
                onCheckedChange={() => toggleSetting('appointments')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="tasks">Tarefas</Label>
                <p className="text-sm text-gray-500">Quando uma tarefa é atribuída ou vence</p>
              </div>
              <Switch
                id="tasks"
                checked={settings.tasks}
                onCheckedChange={() => toggleSetting('tasks')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="reports">Relatórios</Label>
                <p className="text-sm text-gray-500">Relatórios semanais e mensais</p>
              </div>
              <Switch
                id="reports"
                checked={settings.reports}
                onCheckedChange={() => toggleSetting('reports')}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={updateCompany.isPending}>
            {updateCompany.isPending ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
