
import { useState } from 'react';
import { ArrowUp, ArrowDown, Edit, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MeetingAgenda } from '@/types/meeting';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface AgendaItemProps {
  item: MeetingAgenda;
  index: number;
  totalItems: number;
  onUpdate: (id: string, updates: Partial<MeetingAgenda>) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  isDragDisabled?: boolean;
}

export const AgendaItem = ({
  item,
  index,
  totalItems,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isDragDisabled = false,
}: AgendaItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editDescription, setEditDescription] = useState(item.description || '');

  const handleSave = () => {
    onUpdate(item.id, {
      title: editTitle,
      description: editDescription,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(item.title);
    setEditDescription(item.description || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="space-y-3">
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Título do item"
          />
          <Textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Descrição (opcional)"
            rows={2}
          />
          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm">
              Salvar
            </Button>
            <Button onClick={handleCancel} variant="outline" size="sm">
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex items-start gap-3">
        {!isDragDisabled && (
          <div className="flex flex-col gap-1 mt-1">
            <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
          </div>
        )}
        
        <div className="flex items-start gap-2">
          <span className="text-sm font-medium text-gray-500 mt-0.5">
            {index + 1}.
          </span>
        </div>
        
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{item.title}</h4>
          {item.description && (
            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMoveUp(item.id)}
            disabled={index === 0}
            className="h-8 w-8 p-0"
          >
            <ArrowUp className="w-3 h-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMoveDown(item.id)}
            disabled={index === totalItems - 1}
            className="h-8 w-8 p-0"
          >
            <ArrowDown className="w-3 h-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-8 w-8 p-0"
          >
            <Edit className="w-3 h-3" />
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remover item da pauta</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja remover este item da pauta? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(item.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Remover
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};
