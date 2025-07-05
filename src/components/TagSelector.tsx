import { useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { TagBadge } from './TagBadge';
import { useLeadTags } from '@/hooks/useLeadTags';
import { cn } from '@/lib/utils';

interface TagSelectorProps {
  selectedTags: Array<{ id: string; name: string; color: string }>;
  onTagsChange: (tags: Array<{ id: string; name: string; color: string }>) => void;
  placeholder?: string;
}

const TAG_COLORS = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
  '#EC4899', '#F97316', '#84CC16', '#06B6D4', '#6366F1'
];

export const TagSelector = ({ selectedTags, onTagsChange, placeholder = "Selecionar tags..." }: TagSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  
  const { tags, createTag } = useLeadTags();

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    
    const createdTag = await createTag({
      name: newTagName.trim(),
      color: newTagColor
    });
    
    if (createdTag) {
      onTagsChange([...selectedTags, createdTag]);
      setNewTagName('');
      setNewTagColor(TAG_COLORS[0]);
      setShowCreateForm(false);
    }
  };

  const handleToggleTag = (tag: { id: string; name: string; color: string }) => {
    const isSelected = selectedTags.some(t => t.id === tag.id);
    if (isSelected) {
      onTagsChange(selectedTags.filter(t => t.id !== tag.id));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    onTagsChange(selectedTags.filter(t => t.id !== tagId));
  };

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchValue.toLowerCase()) &&
    !selectedTags.some(t => t.id === tag.id)
  );

  return (
    <div className="space-y-2">
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTags.map((tag) => (
            <TagBadge
              key={tag.id}
              name={tag.name}
              color={tag.color}
              onRemove={() => handleRemoveTag(tag.id)}
            />
          ))}
        </div>
      )}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-start text-left font-normal"
          >
            {selectedTags.length > 0 ? `${selectedTags.length} tag(s) selecionada(s)` : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Buscar tags..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandEmpty>
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-2">Nenhuma tag encontrada</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateForm(true)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Criar nova tag
                </Button>
              </div>
            </CommandEmpty>
            
            {!showCreateForm && (
              <CommandGroup>
                {filteredTags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    onSelect={() => handleToggleTag(tag)}
                    className="flex items-center gap-2"
                  >
                    <div
                      className="w-3 h-3 rounded-full border"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="flex-1">{tag.name}</span>
                    <Check
                      className={cn(
                        "w-4 h-4",
                        selectedTags.some(t => t.id === tag.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
                
                {filteredTags.length > 0 && (
                  <CommandItem onSelect={() => setShowCreateForm(true)} className="border-t">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar nova tag
                  </CommandItem>
                )}
              </CommandGroup>
            )}
            
            {showCreateForm && (
              <div className="p-3 border-t">
                <div className="space-y-3">
                  <Input
                    placeholder="Nome da tag"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateTag();
                      }
                    }}
                  />
                  
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">
                      Cor da tag
                    </label>
                    <div className="flex gap-1 flex-wrap">
                      {TAG_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewTagColor(color)}
                          className={cn(
                            "w-6 h-6 rounded-full border-2 transition-all",
                            newTagColor === color ? "border-gray-400 scale-110" : "border-gray-200"
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleCreateTag}
                      disabled={!newTagName.trim()}
                    >
                      Criar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewTagName('');
                        setNewTagColor(TAG_COLORS[0]);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};