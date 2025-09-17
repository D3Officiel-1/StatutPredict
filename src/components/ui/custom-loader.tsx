import { cn } from '@/lib/utils';

interface CustomLoaderProps {
  className?: string;
}

export default function CustomLoader({ className }: CustomLoaderProps) {
  return (
    <div className={cn('flex justify-center items-center', className)}>
      <img
        src="https://1play.gamedev-tech.cc/lucky_grm/assets/media/c544881eb170e73349e4c92d1706a96c.svg"
        alt="Chargement..."
        className="animate-spin h-6 w-6"
      />
    </div>
  );
}
