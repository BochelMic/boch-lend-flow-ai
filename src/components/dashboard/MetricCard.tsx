
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

const variantStyles = {
  default: {
    icon: 'bg-primary/15 text-primary ring-1 ring-primary/20',
    trend: 'text-primary',
    border: 'border-primary/15',
    glow: 'hover:shadow-primary',
  },
  success: {
    icon: 'bg-success/15 text-success ring-1 ring-success/20',
    trend: 'text-success',
    border: 'border-success/15',
    glow: 'hover:shadow-[0_4px_20px_0_hsl(152_60%_45%/0.25)]',
  },
  warning: {
    icon: 'bg-warning/15 text-warning ring-1 ring-warning/20',
    trend: 'text-warning',
    border: 'border-warning/15',
    glow: 'hover:shadow-[0_4px_20px_0_hsl(40_95%_55%/0.25)]',
  },
  danger: {
    icon: 'bg-destructive/15 text-destructive ring-1 ring-destructive/20',
    trend: 'text-destructive',
    border: 'border-destructive/15',
    glow: 'hover:shadow-[0_4px_20px_0_hsl(0_75%_55%/0.25)]',
  },
};

const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  description, 
  variant = 'default' 
}: MetricCardProps) => {
  const isPositive = trend.startsWith('+');
  const styles = variantStyles[variant];
  
  return (
    <Card className={cn('transition-all duration-300 cursor-default', styles.border, styles.glow)}>
      <CardContent className="p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground truncate uppercase tracking-wide">{title}</p>
            <p className="text-xl md:text-2xl font-bold truncate mt-1">{value}</p>
            <div className="flex items-center mt-2 gap-1.5">
              <span className={cn(
                "text-xs font-semibold px-1.5 py-0.5 rounded-md",
                isPositive 
                  ? "bg-success/15 text-success" 
                  : "bg-destructive/15 text-destructive"
              )}>
                {trend}
              </span>
              <span className="text-xs text-muted-foreground hidden sm:inline truncate">{description}</span>
            </div>
          </div>
          <div className={cn(
            "p-2.5 md:p-3 rounded-xl flex-shrink-0",
            styles.icon
          )}>
            <Icon className="h-4 w-4 md:h-5 md:w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
