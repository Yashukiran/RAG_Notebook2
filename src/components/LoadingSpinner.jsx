import { clsx } from 'clsx';

export default function LoadingSpinner({ size = 'md' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  return (
    <div 
      className={clsx(
        "rounded-full animate-spin border-foreground/20 border-t-accent",
        sizes[size]
      )} 
    />
  );
}
