import { useState } from 'react';
import { TrendingUp, Trophy, Clock, Shield, CheckCircle2, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';

export default function StatCard({
  title,
  value,
  change,
  changePercent,
  icon,
  color = 'blue',
  showChange = true,
  tooltip
}) {
  const [isHovered, setIsHovered] = useState(false);

  // Determine colors based on type
  const getColors = (type) => {
    switch (type) {
      case 'blue':
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/20',
          hoverBorder: 'border-blue-500/30',
          iconBg: 'bg-blue-500/20',
          iconColor: 'text-blue-400',
          accent: change && change > 0 ? 'text-emerald-400' : change && change < 0 ? 'text-rose-400' : 'text-slate-400'
        };
      case 'purple':
        return {
          bg: 'bg-purple-500/10',
          border: 'border-purple-500/20',
          hoverBorder: 'border-purple-500/30',
          iconBg: 'bg-purple-500/20',
          iconColor: 'text-purple-400',
          accent: change && change > 0 ? 'text-emerald-400' : change && change < 0 ? 'text-rose-400' : 'text-slate-400'
        };
      case 'green':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/20',
          hoverBorder: 'border-emerald-500/30',
          iconBg: 'bg-emerald-500/20',
          iconColor: 'text-emerald-400',
          accent: 'text-emerald-400'
        };
      case 'red':
        return {
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/20',
          hoverBorder: 'border-rose-500/30',
          iconBg: 'bg-rose-500/20',
          iconColor: 'text-rose-400',
          accent: 'text-rose-400'
        };
      case 'yellow':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
          hoverBorder: 'border-amber-500/30',
          iconBg: 'bg-amber-500/20',
          iconColor: 'text-amber-400',
          accent: change && change > 0 ? 'text-emerald-400' : change && change < 0 ? 'text-rose-400' : 'text-slate-400'
        };
      default:
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/20',
          hoverBorder: 'border-blue-500/30',
          iconBg: 'bg-blue-500/20',
          iconColor: 'text-blue-400',
          accent: change && change > 0 ? 'text-emerald-400' : change && change < 0 ? 'text-rose-400' : 'text-slate-400'
        };
    }
  };

  const colors = getColors(color);

  // Format change display
  const formatChange = () => {
    if (!showChange || change === undefined || change === null) return null;

    const absChange = Math.abs(change);
    const formattedChange = changePercent !== undefined
      ? `${changePercent}%`
      : absChange >= 1000
        ? `${(absChange / 1000).toFixed(1)}k`
        : absChange.toString();

    return (
      <div className={`flex items-center space-x-1 mt-1 text-xs
        ${change && change > 0 ? 'text-emerald-400' : change && change < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
        {change > 0 ? <ArrowUp className="w-3 h-3" /> : change < 0 ? <ArrowDown className="w-3 h-3" /> : ''}
        <span>{formattedChange}</span>
        {tooltip && (
          <span className="ml-1 text-slate-400 hover:text-slate-300 cursor-help" title={tooltip}>
            <AlertTriangle className="w-3 h-3" />
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      className={`relative flex flex-col items-center p-4 rounded-2xl border ${colors.border}
      bg-slate-900/50 backdrop-blur-lg hover:border-slate-700/80 hover:scale-[1.02]
      transition-all duration-200 ${isHovered ? 'shadow-xl' : 'shadow-lg'}
      ${colors.bg} border-b-${colors.accent.slice(0, -1)}-500/20`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon */}
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl
        ${colors.iconBg} ${colors.iconColor}`}>
        {icon}
      </div>

      {/* Value */}
      <div className="text-2xl font-extrabold text-white mb-2">
        {value}
      </div>

      {/* Title */}
      <div className="text-center text-xs text-slate-400 uppercase tracking-wider">
        {title}
      </div>

      {/* Change indicator */}
      {formatChange()}
    </div>
  );
}