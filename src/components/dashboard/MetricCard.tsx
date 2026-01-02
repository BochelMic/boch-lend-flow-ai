
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
      <CardContent className="p-3 md:p-6">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">{title}</p>
            <p className="text-lg md:text-2xl font-bold truncate">{value}</p>
            <div className="flex items-center mt-1 md:mt-2 flex-wrap gap-1">
              <span className={cn(
                "text-xs md:text-sm font-medium",
                isPositive ? "text-success" : "text-destructive"
              )}>
                {trend}
              </span>
              <span className="text-xs text-muted-foreground hidden sm:inline">{description}</span>
            </div>
          </div>
          <div className={cn(
            "p-2 md:p-3 rounded-full flex-shrink-0",
            variant === 'success' && "bg-success/20 text-success",
            variant === 'warning' && "bg-warning/20 text-warning",
            variant === 'danger' && "bg-destructive/20 text-destructive",
            variant === 'default' && "bg-primary/20 text-primary"
          )}>
            <Icon className="h-4 w-4 md:h-6 md:w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
