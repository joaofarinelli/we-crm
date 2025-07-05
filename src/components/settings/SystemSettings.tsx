
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Settings, Bell, Clock } from 'lucide-react';
import { usePipelineColumns } from '@/hooks/usePipelineColumns';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { useToast } from '@/hooks/use-toast';

export const SystemSettings = () => {
  const { toast } = useToast();
  const { columns, createColumn, deleteColumn } = usePipelineColumns();
  const { company, updateCompany } = useCompanySettings();
  const [newColumnName, setNewColumnName] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  
  // Configurações básicas
  const [basicSettings, setBasicSettings] = useState({
    timezone: 'America/Sao_Paulo',
    currency: 'BRL',
    date_format: 'DD/MM/YYYY',
  });

  // Configurações de notificações
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    leads: true,
    appointments: true,
  });

  useEffect(() => {
    if (company) {
      setBasicSettings({
        timezone: company.timezone || 'America/Sao_Paulo',
        currency: company.currency || 'BRL',
        date_format: company.date_format || 'DD/MM/YYYY',
      });
      
      if (company.notification_settings) {
        setNotifications(prev => ({
          ...prev,
          ...company.notification_settings,
        }));
      }
    }
  }, [company]);

  const handleAddColumn = async () => {
    if (!newColumnName.trim()) return;
    
    setIsAddingColumn(true);
    try {
      await createColumn({
        name: newColumnName,
        color: '#3B82F6',
        position: columns.length,
      });
      setNewColumnName('');
      toast({
        title: 'Coluna adicionada',
        description: 'Nova coluna do pipeline criada com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar a coluna.',
        variant: 'destructive',
      });
    } finally {
      setIsAddingColumn(false);
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    try {
      await deleteColumn(columnId);
      toast({
        title: 'Coluna removida',
        description: 'Coluna do pipeline removida com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a coluna.',
        variant: 'destructive',
      });
    }
  };

  const saveBasicSettings = () => {
    updateCompany.mutate(basicSettings);
  };

  const saveNotifications = () => {
    updateCompany.mutate({
      notification_settings: {
        email_notifications: notifications.email,
        whatsapp_notifications: notifications.sms
      }
    });
  };

  const toggleNotification = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Configurações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Configurações Básicas
          </CardTitle>
          <CardDescription>
            Fuso horário, moeda e formato de data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Fuso Horário</Label>
              <Select 
                value={basicSettings.timezone} 
                onValueChange={(value) => setBasicSettings(prev => ({ ...prev, timezone: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">Brasília (UTC-3)</SelectItem>
                  <SelectItem value="America/Manaus">Manaus (UTC-4)</SelectItem>
                  <SelectItem value="America/Rio_Branco">Rio Branco (UTC-5)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Moeda</Label>
              <Select 
                value={basicSettings.currency} 
                onValueChange={(value) => setBasicSettings(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">Real (R$)</SelectItem>
                  <SelectItem value="USD">Dólar ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_format">Formato de Data</Label>
              <Select 
                value={basicSettings.date_format} 
                onValueChange={(value) => setBasicSettings(prev => ({ ...prev, date_format: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/AAAA</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/AAAA</SelectItem>
                  <SelectItem value="YYYY-MM-DD">AAAA-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={saveBasicSettings} disabled={updateCompany.isPending}>
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Pipeline de Vendas
          </CardTitle>
          <CardDescription>
            Gerencie as colunas do seu pipeline
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {columns.map((column) => (
              <div
                key={column.id}
                className="p-3 border rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: column.color }}
                  />
                  <span className="text-sm font-medium">{column.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteColumn(column.id)}
                  className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex items-center space-x-2">
            <Input
              placeholder="Nome da nova coluna"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleAddColumn}
              disabled={isAddingColumn || !newColumnName.trim()}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificações
          </CardTitle>
          <CardDescription>
            Configure como você quer receber notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Canais</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <Switch
                    id="email"
                    checked={notifications.email}
                    onCheckedChange={() => toggleNotification('email')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="push" className="text-sm">Push</Label>
                  <Switch
                    id="push"
                    checked={notifications.push}
                    onCheckedChange={() => toggleNotification('push')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sms" className="text-sm">SMS</Label>
                  <Switch
                    id="sms"
                    checked={notifications.sms}
                    onCheckedChange={() => toggleNotification('sms')}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Tipos</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="leads" className="text-sm">Novos Leads</Label>
                  <Switch
                    id="leads"
                    checked={notifications.leads}
                    onCheckedChange={() => toggleNotification('leads')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="appointments" className="text-sm">Agendamentos</Label>
                  <Switch
                    id="appointments"
                    checked={notifications.appointments}
                    onCheckedChange={() => toggleNotification('appointments')}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button onClick={saveNotifications} disabled={updateCompany.isPending}>
              Salvar Notificações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
