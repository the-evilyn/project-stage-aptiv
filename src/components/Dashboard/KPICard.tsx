import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ComponentType<any>;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    border: 'border-blue-200'
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    border: 'border-green-200'
  },
  yellow: {
    bg: 'bg-yellow-50',
    icon: 'text-yellow-600',
    border: 'border-yellow-200'
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    border: 'border-red-200'
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    border: 'border-purple-200'
  }
};

export const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  unit, 
  trend, 
  icon: Icon, 
  color 
}) => {
  const classes = colorClasses[color];

  return (
    <div className={`${classes.bg} ${classes.border} border rounded-xl p-6 transition-all hover:shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${classes.bg} ${classes.border} border`}>
          <Icon className={`w-6 h-6 ${classes.icon}`} />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-sm ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
        <div className="flex items-baseline space-x-1">
          <span className="text-3xl font-bold text-gray-900">{value}</span>
          {unit && <span className="text-sm text-gray-500">{unit}</span>}
        </div>
      </div>
    </div>
  );
};