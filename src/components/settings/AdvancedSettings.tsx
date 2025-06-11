
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Plug, FileText, Shield } from 'lucide-react';

export const AdvancedSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Configurações Avançadas
          </CardTitle>
          <CardDescription>
            Recursos avançados e integrações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <CreditCard className="w-5 h-5 text-blue-500" />
                <div>
                  <h4 className="font-medium">Plano & Faturamento</h4>
                  <p className="text-sm text-gray-600">Gerencie seu plano e faturas</p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                Em breve
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Plug className="w-5 h-5 text-green-500" />
                <div>
                  <h4 className="font-medium">Integrações</h4>
                  <p className="text-sm text-gray-600">Conecte ferramentas externas</p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                Em breve
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="w-5 h-5 text-purple-500" />
                <div>
                  <h4 className="font-medium">Logs de Auditoria</h4>
                  <p className="text-sm text-gray-600">Histórico de atividades</p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                Em breve
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-5 h-5 text-red-500" />
                <div>
                  <h4 className="font-medium">Segurança</h4>
                  <p className="text-sm text-gray-600">Configurações de segurança</p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                Em breve
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
