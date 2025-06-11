
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, Plus, X, Palette } from 'lucide-react';
import { usePipelineColumns } from '@/hooks/usePipelineColumns';
import { useCompanySettings } from '@/hooks/useCompanySettings';

export const SystemSettings = () => {
  const { columns, createColumn, updateColumn, deleteColumn } = usePipelineColumns();
  const { getSetting, updateSetting } = useCompanySettings();
  
  const [newColumn, setNewColumn] = useState({ name: '', color: '#3B82F6' });
  const [leadSources, setLeadSources] = useState(
    getSetting('lead_sources') || ['Website', 'Telefone', 'Email', 'Indicação', 'Redes Sociais']
  );
  const [leadStatuses, setLeadStatuses] = useState(
    getSetting('lead_statuses') || ['Frio', 'Morno', 'Quente', 'Qualificado']
  );

  const handleAddColumn = () => {
    if (newColumn.name.trim()) {
      createColumn.mutateAsync({
        name: newColumn.name,
        color: newColumn.color,
        order_index: columns.length,
      });
      setNewColumn({ name: '', color: '#3B82F6' });
    }
  };

  const handleAddLeadSource = () => {
    const newSource = prompt('Nova fonte de lead:');
    if (newSource && !leadSources.includes(newSource)) {
      const updated = [...leadSources, newSource];
      setLeadSources(updated);
      updateSetting.mutateAsync({ key: 'lead_sources', value: updated });
    }
  };

  const handleRemoveLeadSource = (source: string) => {
    const updated = leadSources.filter(s => s !== source);
    setLeadSources(updated);
    updateSetting.mutateAsync({ key: 'lead_sources', value: updated });
  };

  const handleAddLeadStatus = () => {
    const newStatus = prompt('Novo status de lead:');
    if (newStatus && !leadStatuses.includes(newStatus)) {
      const updated = [...leadStatuses, newStatus];
      setLeadStatuses(updated);
      updateSetting.mutateAsync({ key: 'lead_statuses', value: updated });
    }
  };

  const handleRemoveLeadStatus = (status: string) => {
    const updated = leadStatuses.filter(s => s !== status);
    setLeadStatuses(updated);
    updateSetting.mutateAsync({ key: 'lead_statuses', value: updated });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pipeline Configuration */}
          <div>
            <h3 className="text-lg font-medium mb-4">Configuração do Pipeline</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Nome da nova coluna"
                  value={newColumn.name}
                  onChange={(e) => setNewColumn(prev => ({ ...prev, name: e.target.value }))}
                />
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  <input
                    type="color"
                    value={newColumn.color}
                    onChange={(e) => setNewColumn(prev => ({ ...prev, color: e.target.value }))}
                    className="w-10 h-10 border rounded cursor-pointer"
                  />
                </div>
                <Button onClick={handleAddColumn} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {columns.map((column) => (
                  <div key={column.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: column.color }}
                      />
                      <span className="font-medium">{column.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteColumn.mutateAsync(column.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Lead Sources */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Fontes de Leads</h3>
              <Button onClick={handleAddLeadSource} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Fonte
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {leadSources.map((source) => (
                <Badge key={source} variant="secondary" className="flex items-center gap-2">
                  {source}
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-red-500" 
                    onClick={() => handleRemoveLeadSource(source)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Lead Statuses */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Status de Leads</h3>
              <Button onClick={handleAddLeadStatus} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Status
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {leadStatuses.map((status) => (
                <Badge key={status} variant="secondary" className="flex items-center gap-2">
                  {status}
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-red-500" 
                    onClick={() => handleRemoveLeadStatus(status)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
