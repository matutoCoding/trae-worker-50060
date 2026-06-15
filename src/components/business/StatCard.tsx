import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  color?: 'blue' | 'green' | 'orange' | 'yellow' | 'red';
  progress?: number;
}

const colorClasses = {
  blue: 'from-[#3E92CC] to-[#0A2463]',
  green: 'from-[#44AF69] to-[#2D7A4A]',
  orange: 'from-[#FF6B35] to-[#C44D27]',
  yellow: 'from-[#F9C80E] to-[#D4A80B]',
  red: 'from-[#E63946] to-[#B02A35]',
};

export default function StatCard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  trendLabel,
  color = 'blue',
  progress,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-black/5 p-6 hover:shadow-xl transition-all duration-300 border border-white/50">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-[#4A4A6A] font-medium mb-1">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-[#1A1A2E]">{value}</span>
            {unit && <span className="text-sm text-[#4A4A6A]">{unit}</span>}
          </div>
        </div>
        <div className={cn(
          'w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg',
          colorClasses[color]
        )}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>

      {trend !== undefined && (
        <div className="flex items-center gap-2 text-sm">
          {trend >= 0 ? (
            <TrendingUp className="w-4 h-4 text-[#44AF69]" />
          ) : (
            <TrendingDown className="w-4 h-4 text-[#E63946]" />
          )}
          <span className={trend >= 0 ? 'text-[#44AF69]' : 'text-[#E63946]'}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
          {trendLabel && <span className="text-[#4A4A6A]">{trendLabel}</span>}
        </div>
      )}

      {progress !== undefined && (
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[#4A4A6A]">进度</span>
            <span className="font-medium text-[#1A1A2E]">{progress}%</span>
          </div>
          <div className="h-2 bg-[#E8E8F0] rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500 bg-gradient-to-r',
                colorClasses[color]
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
