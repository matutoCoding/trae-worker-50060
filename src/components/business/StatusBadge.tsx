import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variantClasses = {
  default: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export default function StatusBadge({ status, variant = 'default', size = 'md', className }: StatusBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center font-medium rounded-full transition-colors',
      variantClasses[variant],
      sizeClasses[size],
      className
    )}>
      <span className={cn(
        'w-2 h-2 rounded-full mr-2',
        variant === 'success' && 'bg-green-500',
        variant === 'warning' && 'bg-yellow-500',
        variant === 'danger' && 'bg-red-500',
        variant === 'info' && 'bg-blue-500',
        variant === 'default' && 'bg-gray-500',
      )} />
      {status}
    </span>
  );
}
