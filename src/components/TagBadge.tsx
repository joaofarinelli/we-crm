import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagBadgeProps {
  name: string;
  color: string;
  onRemove?: () => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const TagBadge = ({ name, color, onRemove, className, size = 'sm' }: TagBadgeProps) => {
  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1 border",
        size === 'sm' ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className
      )}
      style={{
        borderColor: color,
        backgroundColor: `${color}15`,
        color: color
      }}
    >
      <span className="truncate max-w-24">{name}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:bg-current hover:bg-opacity-20 rounded-full p-0.5 transition-colors"
          type="button"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </Badge>
  );
};