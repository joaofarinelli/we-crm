
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingIndicatorProps {
  className?: string;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingIndicator = ({ 
  className, 
  text = "Carregando...", 
  size = 'md' 
}: LoadingIndicatorProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      <span className="text-sm text-gray-600">{text}</span>
    </div>
  );
};
