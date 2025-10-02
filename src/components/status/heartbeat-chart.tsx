'use client';
import { cn } from '@/lib/utils';
import type { HeartbeatStatus } from '@/types';

interface HeartbeatChartProps {
  status: HeartbeatStatus;
}

export default function HeartbeatChart({ status }: HeartbeatChartProps) {
  const getLineColor = () => {
    switch (status) {
      case 'healthy':
        return 'stroke-green-500';
      case 'unstable':
        return 'stroke-yellow-500';
      case 'flatline':
        return 'stroke-orange-500';
      default:
        return 'stroke-green-500';
    }
  };

  const getGlowColor = () => {
    switch (status) {
        case 'healthy':
            return 'shadow-[0_0_8px_0_rgba(74,222,128,0.7)]';
        case 'unstable':
            return 'shadow-[0_0_8px_0_rgba(234,179,8,0.7)]';
        case 'flatline':
            return 'shadow-[0_0_8px_0_rgba(249,115,22,0.7)]';
        default:
            return 'shadow-[0_0_8px_0_rgba(74,222,128,0.7)]';
    }
  }

  const pathD = {
    healthy: 'M0,50 L40,50 L50,30 L60,70 L70,40 L80,55 L90,50 L300,50',
    unstable: 'M0,50 L80,50 L85,45 L90,55 L95,50 L100,52 L105,48 L200,50 L210,55 L220,40 L230,50 L300,50',
    flatline: 'M0,50 L300,50',
  };

  const currentPath = pathD[status];

  return (
    <div className="relative h-40 w-full overflow-hidden bg-black/50 rounded-lg p-2 border border-border">
      {/* Grid lines */}
      <div className="absolute inset-0 grid-pattern-faded"></div>
      
      {/* SVG Container */}
      <div className="w-full h-full animate-infinite-scroll">
        <svg
            className="w-[200%] h-full"
            preserveAspectRatio="none"
            viewBox="0 0 600 100"
        >
            <path
                d={`${currentPath} L300,50 ${currentPath.replace('M0,50', 'L300,50')}`}
                className={cn('filter-glow animate-pulse-slow', getLineColor())}
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
            />
            <path
                d={`${currentPath} L300,50 ${currentPath.replace('M0,50', 'L300,50')}`}
                className={cn(getLineColor())}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
        </svg>
      </div>
      
      {/* Fading overlay for scrolling effect */}
      <div className="absolute top-0 right-0 h-full w-10 bg-gradient-to-l from-black/80 to-transparent z-10"></div>
      <div className="absolute top-0 left-0 h-full w-10 bg-gradient-to-r from-black/80 to-transparent z-10"></div>
    </div>
  );
}
