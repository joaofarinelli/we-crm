
import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RefreshCw, Plus } from 'lucide-react';
import { usePipelineColumns } from '@/hooks/usePipelineColumns';
import { useAppointments } from '@/hooks/useAppointments';
import { usePipelineSync } from '@/hooks/usePipelineSync';

export const PipelineStatusIndicator = () => {
  const { columns } = usePipelineColumns();
  const { appointments } = useAppointments();
  const { syncPipelineColumns, createDefaultColumns, syncing } = usePipelineSync();
  const [missingStatuses, setMissingStatuses] = useState<string[]>([]);

  useEffect(() => {
    // Check for appointment statuses that don't have corresponding pipeline columns
    const appointmentStatuses = [...new Set(appointments.map(app => app.status))];
    const columnNames = columns.map(col => col.name);
    const missing = appointmentStatuses.filter(status => !columnNames.includes(status));
    setMissingStatuses(missing);
  }, [appointments, columns]);

  if (missingStatuses.length === 0) {
    return null;
  }

  return (
    <Alert className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-medium mb-2">
              Alguns agendamentos não aparecem no pipeline porque seus status não correspondem às colunas existentes.
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-sm text-gray-600">Status sem colunas:</span>
              {missingStatuses.map(status => (
                <Badge key={status} variant="destructive">
                  {status}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={createDefaultColumns}
              disabled={syncing}
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Colunas Padrão
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={syncPipelineColumns}
              disabled={syncing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              Sincronizar
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};
