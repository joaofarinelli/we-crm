
import { Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RealtimeBadgeProps {
  isUpdating: boolean;
  className?: string;
}

export const RealtimeBadge = ({ isUpdating, className }: RealtimeBadgeProps) => {
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "transition-all duration-300",
        isUpdating 
          ? "bg-green-50 text-green-700 border-green-200" 
          : "bg-gray-50 text-gray-600 border-gray-200",
        className
      )}
    >
      {isUpdating ? (
        <>
          <Wifi className="w-3 h-3 mr-1 animate-pulse" />
          Atualizando...
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3 mr-1" />
          Conectado
        </>
      )}
    </Badge>
  );
};
