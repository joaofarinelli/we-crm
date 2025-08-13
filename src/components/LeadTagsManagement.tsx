import { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useLeadTags } from '@/hooks/useLeadTags';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { cn } from '@/lib/utils';

const TAG_COLORS = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
  '#EC4899', '#F97316', '#84CC16', '#06B6D4', '#6366F1'
];

interface EditingTag {
  id: string;
  name: string;
  color: string;
}

export const LeadTagsManagement = () => {
  const { tags, loading, createTag, updateTag, deleteTag } = useLeadTags();
  const { hasCompany } = useCurrentUser();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingTag, setEditingTag] = useState<EditingTag | null>(null);
  const [tagToDelete, setTagToDelete] = useState<{ id: string; name: string } | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    
    const success = await createTag({
      name: newTagName.trim(),
      color: newTagColor
    });
    
    if (success) {
      setNewTagName('');
      setNewTagColor(TAG_COLORS[0]);
      setShowCreateDialog(false);
    }
  };

  const handleEditTag = async () => {
    if (!editingTag || !editingTag.name.trim()) return;
    
    const success = await updateTag(editingTag.id, {
      name: editingTag.name.trim(),
      color: editingTag.color
    });
    
    if (success) {
      setEditingTag(null);
      setShowEditDialog(false);
    }
  };

  const handleDeleteTag = async () => {
    if (!tagToDelete) return;
    
    await deleteTag(tagToDelete.id);
    setTagToDelete(null);
  };

  const openEditDialog = (tag: { id: string; name: string; color: string }) => {
    setEditingTag(tag);
    setShowEditDialog(true);
  };

  if (!hasCompany) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Configure sua empresa primeiro
            </h2>
            <p className="text-gray-600">
              Você precisa configurar uma empresa antes de gerenciar tags de leads.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando tags...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Tags de Leads</h1>
          <p className="text-gray-600 mt-1">Organize seus leads com tags personalizadas</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Tag
        </Button>
      </div>

      {tags.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma tag encontrada
            </h3>
            <p className="text-gray-600 mb-4">
              Crie sua primeira tag para começar a organizar seus leads.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar primeira tag
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tags.map((tag) => (
            <Card key={tag.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="font-medium text-gray-900 truncate">
                      {tag.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => openEditDialog(tag)}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      onClick={() => setTagToDelete({ id: tag.id, name: tag.name })}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Criada em {new Date(tag.created_at).toLocaleDateString('pt-BR')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Tag Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Criar Nova Tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tagName">Nome da Tag</Label>
              <Input
                id="tagName"
                placeholder="Digite o nome da tag"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreateTag();
                  }
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Cor da Tag</Label>
              <div className="flex gap-2 flex-wrap">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewTagColor(color)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      newTagColor === color ? "border-gray-400 scale-110" : "border-gray-200"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setNewTagName('');
                setNewTagColor(TAG_COLORS[0]);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateTag} disabled={!newTagName.trim()}>
              <Save className="w-4 h-4 mr-2" />
              Criar Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Tag Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Tag</DialogTitle>
          </DialogHeader>
          {editingTag && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editTagName">Nome da Tag</Label>
                <Input
                  id="editTagName"
                  placeholder="Digite o nome da tag"
                  value={editingTag.name}
                  onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleEditTag();
                    }
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Cor da Tag</Label>
                <div className="flex gap-2 flex-wrap">
                  {TAG_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setEditingTag({ ...editingTag, color })}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        editingTag.color === color ? "border-gray-400 scale-110" : "border-gray-200"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                setEditingTag(null);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleEditTag} disabled={!editingTag?.name.trim()}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!tagToDelete} onOpenChange={(open) => !open && setTagToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar a tag "{tagToDelete?.name}"? 
              Esta ação não pode ser desfeita e a tag será removida de todos os leads que a possuem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTag}
              className="bg-red-600 hover:bg-red-700"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};