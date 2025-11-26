import React from 'react';
import { Info } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
  info?: string; // New: Tooltip content
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, trend, color = "blue", info }) => {
  const colorClasses = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    green: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    orange: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    rose: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  };

  const selectedColor = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <div className={`p-6 rounded-xl border ${selectedColor.split(' ')[2]} bg-slate-800/50 backdrop-blur-sm relative group`}>
      <div className="flex justify-between items-start mb-2">
        <p className="text-sm font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
            {title}
        </p>
        {info && (
            <div className="relative group/tooltip">
                <Info size={14} className="text-slate-500 hover:text-slate-300 cursor-help" />
                <div className="absolute right-0 top-6 w-48 p-2 bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded shadow-xl z-20 opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none">
                    {info}
                </div>
            </div>
        )}
      </div>
      
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-bold text-white">{value}</h3>
        {trend && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${trend === 'up' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
            {trend === 'up' ? '↗' : '↘'} Trend
          </span>
        )}
      </div>
      {subtitle && <p className="text-sm text-slate-500 mt-2">{subtitle}</p>}
    </div>
  );
};