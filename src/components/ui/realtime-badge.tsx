import { Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
interface RealtimeBadgeProps {
  isUpdating: boolean;
  className?: string;
}
export const RealtimeBadge = ({
  isUpdating,
  className
}: RealtimeBadgeProps) => {
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "flex items-center gap-2 text-xs",
        isUpdating ? "text-green-600 border-green-200" : "text-gray-500 border-gray-200",
        className
      )}
    >
      {isUpdating ? (
        <>
          <Wifi className="w-3 h-3" />
          Atualizando...
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          Conectado
        </>
      )}
    </Badge>
  );
};