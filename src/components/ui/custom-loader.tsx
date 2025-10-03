
import { cn } from '@/lib/utils';

interface CustomLoaderProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function CustomLoader({ className, size = 'medium' }: CustomLoaderProps) {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-6 w-6',
    large: 'h-12 w-12',
  };

  return (
    <div className={cn('flex justify-center items-center', className)}>
      <img
        src="https://1play.gamedev-tech.cc/lucky_grm/assets/media/c544881eb170e73349e4c92d1706a96c.svg"
        alt="Chargement..."
        className={cn(sizeClasses[size])}
      />
    </div>
  );
}

    