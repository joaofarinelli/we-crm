
import { useState } from 'react';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePipelineColumns } from '@/hooks/usePipelineColumns';

interface PipelineColumn {
  id: string;
  name: string;
  order_index: number;
  color: string;
}

export const PipelineColumnManager = () => {
  const { columns, createColumn, updateColumn, deleteColumn } = usePipelineColumns();
  const [editingColumn, setEditingColumn] = useState<PipelineColumn | null>(null);
  const [newColumn, setNewColumn] = useState({ name: '', color: '#3B82F6' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleCreateColumn = async () => {
    if (!newColumn.name.trim()) return;
    
    const maxOrder = Math.max(...columns.map(col => col.order_index), 0);
    await createColumn({
      name: newColumn.name,
      color: newColumn.color,
      order_index: maxOrder + 1
    });
    
    setNewColumn({ name: '', color: '#3B82F6' });
    setDialogOpen(false);
  };

  const handleUpdateColumn = async () => {
    if (!editingColumn || !editingColumn.name.trim()) return;
    
    await updateColumn(editingColumn.id, {
      name: editingColumn.name,
      color: editingColumn.color
    });
    
    setEditingColumn(null);
    setEditDialogOpen(false);
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta coluna? Todos os leads nela serão movidos para "Frio".')) {
      await deleteColumn(columnId);
    }
  };

  const colorOptions = [
    { name: 'Azul', value: '#3B82F6' },
    { name: 'Verde', value: '#10B981' },
    { name: 'Amarelo', value: '#F59E0B' },
    { name: 'Vermelho', value: '#EF4444' },
    { name: 'Roxo', value: '#8B5CF6' },
    { name: 'Rosa', value: '#EC4899' },
    { name: 'Cinza', value: '#6B7280' },
  ];

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Gerenciar Colunas do Pipeline</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Coluna
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Coluna</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Coluna</Label>
                <Input
                  id="name"
                  value={newColumn.name}
                  onChange={(e) => setNewColumn(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Qualificado"
                />
              </div>
              <div>
                <Label htmlFor="color">Cor</Label>
                <div className="flex gap-2 mt-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newColumn.color === color.value ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setNewColumn(prev => ({ ...prev, color: color.value }))}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateColumn} className="flex-1">
                  Criar Coluna
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {columns.map((column) => (
          <div
            key={column.id}
            className="flex items-center gap-3 p-3 border rounded-lg"
          >
            <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: column.color }}
            />
            <span className="flex-1 font-medium">{column.name}</span>
            <span className="text-sm text-gray-500">Ordem: {column.order_index}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditingColumn(column);
                setEditDialogOpen(true);
              }}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => handleDeleteColumn(column.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Dialog de Edição */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Coluna</DialogTitle>
          </DialogHeader>
          {editingColumn && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nome da Coluna</Label>
                <Input
                  id="edit-name"
                  value={editingColumn.name}
                  onChange={(e) => setEditingColumn(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-color">Cor</Label>
                <div className="flex gap-2 mt-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      className={`w-8 h-8 rounded-full border-2 ${
                        editingColumn.color === color.value ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setEditingColumn(prev => prev ? ({ ...prev, color: color.value }) : null)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleUpdateColumn} className="flex-1">
                  Salvar Alterações
                </Button>
                <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
