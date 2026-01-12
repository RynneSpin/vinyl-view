import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'purple' | 'pink' | 'blue' | 'gold';
  className?: string;
}

export default function Badge({
  children,
  variant = 'default',
  className,
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-vinyl-700 text-vinyl-200',
    purple: 'bg-accent-purple/20 text-accent-purple border border-accent-purple/30',
    pink: 'bg-accent-pink/20 text-accent-pink border border-accent-pink/30',
    blue: 'bg-accent-blue/20 text-accent-blue border border-accent-blue/30',
    gold: 'bg-accent-gold/20 text-accent-gold border border-accent-gold/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
