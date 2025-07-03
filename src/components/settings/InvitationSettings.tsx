import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useInvitationSettings } from '@/hooks/useInvitationSettings';
import { Mail, Link2, Settings } from 'lucide-react';

export const InvitationSettings = () => {
  const { settings, loading, updateSettings } = useInvitationSettings();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Carregando configurações...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <CardTitle>Configurações de Convites</CardTitle>
          </div>
          <CardDescription>
            Configure como os convites são enviados para novos usuários
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Método padrão de convite */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="useNativeInvites" className="text-base font-medium">
                  Usar convites automáticos por email
                </Label>
                <p className="text-sm text-muted-foreground">
                  Quando ativado, os convites serão enviados automaticamente por email pelo sistema
                </p>
              </div>
              <Switch
                id="useNativeInvites"
                checked={settings.useNativeInvites}
                onCheckedChange={(checked) => updateSettings({ useNativeInvites: checked })}
              />
            </div>

            {settings.useNativeInvites && (
              <div className="ml-4 p-4 border-l-2 border-primary/20 bg-primary/5 rounded-r">
                <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                  <Mail className="w-4 h-4" />
                  Convites automáticos ativados
                </div>
                <p className="text-sm text-muted-foreground">
                  Os usuários receberão emails diretamente do sistema com links de registro personalizados.
                </p>
              </div>
            )}

            {!settings.useNativeInvites && (
              <div className="ml-4 p-4 border-l-2 border-muted bg-muted/50 rounded-r">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <Link2 className="w-4 h-4" />
                  Modo manual
                </div>
                <p className="text-sm text-muted-foreground">
                  Você precisará compartilhar links de registro manualmente com os usuários.
                </p>
              </div>
            )}
          </div>

          {/* Configuração padrão para novo convite */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="defaultSendEmail" className="text-base font-medium">
                  Enviar email por padrão
                </Label>
                <p className="text-sm text-muted-foreground">
                  Quando ativado, a opção "Enviar email automaticamente" vem marcada por padrão
                </p>
              </div>
              <Switch
                id="defaultSendEmail"
                checked={settings.defaultSendEmail}
                onCheckedChange={(checked) => updateSettings({ defaultSendEmail: checked })}
              />
            </div>
          </div>

          {/* URL de redirecionamento customizada */}
          <div className="space-y-2">
            <Label htmlFor="redirectUrl" className="text-base font-medium">
              URL de redirecionamento (opcional)
            </Label>
            <p className="text-sm text-muted-foreground">
              URL personalizada para onde os usuários serão redirecionados após se registrarem
            </p>
            <Input
              id="redirectUrl"
              value={settings.redirectUrl || ''}
              onChange={(e) => updateSettings({ redirectUrl: e.target.value || null })}
              placeholder="https://sua-empresa.com/boas-vindas"
              className="font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Como funcionam os convites</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium">Convite por Email</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Email enviado automaticamente</li>
                <li>• Link direto para registro</li>
                <li>• Aplicação automática de cargo</li>
                <li>• Melhor experiência do usuário</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Link2 className="w-5 h-5 text-gray-600" />
                <h3 className="font-medium">Convite Manual</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Link gerado para compartilhar</li>
                <li>• Você controla o envio</li>
                <li>• Aplicação automática de cargo</li>
                <li>• Útil para canais próprios</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};