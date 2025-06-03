
import React from 'react';
import { Card, CardContent } from '../ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend: string;
  description: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  description, 
  variant = 'default' 
}: MetricCardProps) => {
  const isPositive = trend.startsWith('+');
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <div className="flex items-center mt-2">
              <span className={cn(
                "text-sm font-medium",
                isPositive ? "text-green-600" : "text-red-600"
              )}>
                {trend}
              </span>
              <span className="text-sm text-gray-500 ml-1">{description}</span>
            </div>
          </div>
          <div className={cn(
            "p-3 rounded-full",
            variant === 'success' && "bg-green-100 text-green-600",
            variant === 'warning' && "bg-yellow-100 text-yellow-600",
            variant === 'danger' && "bg-red-100 text-red-600",
            variant === 'default' && "bg-blue-100 text-blue-600"
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
