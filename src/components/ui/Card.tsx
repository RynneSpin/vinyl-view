import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'bordered';
}

export default function Card({
  children,
  variant = 'default',
  className,
  ...props
}: CardProps) {
  const variantStyles = {
    default: 'bg-vinyl-900 border border-vinyl-800',
    elevated: 'bg-vinyl-900 shadow-xl shadow-black/50',
    bordered: 'bg-vinyl-900 border-2 border-vinyl-700',
  };

  return (
    <div
      className={cn(
        'rounded-lg p-4',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
