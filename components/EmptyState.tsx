import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  buttonText?: string;
  buttonIcon?: LucideIcon;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  buttonText,
  buttonIcon: ButtonIcon,
  onAction
}: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-border/80 bg-card/20 backdrop-blur-sm my-8 p-12 lg:p-20">
      <div className="flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-24 h-24 bg-primary/10 border border-primary/20 shadow-inner rounded-[2rem] flex items-center justify-center text-primary mb-2 rotate-3 hover:rotate-0 transition-transform duration-500">
          <Icon className="w-12 h-12 opacity-90" strokeWidth={1.5} />
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-black text-foreground tracking-tight">{title}</h3>
          <p className="text-[15px] text-muted-foreground font-medium max-w-md mx-auto leading-relaxed">{description}</p>
        </div>
        {buttonText && onAction && (
          <Button 
            onClick={onAction}
            size="lg" 
            className="bg-primary hover:bg-primary/95 text-primary-foreground shadow-lg shadow-primary/20 font-bold rounded-xl h-12 px-8 mt-4 transition-all hover:-translate-y-1 active:scale-95 text-[15px]"
          >
            {ButtonIcon && <ButtonIcon className="w-5 h-5 ml-2 -mr-1" />}
            {buttonText}
          </Button>
        )}
      </div>
    </div>
  );
}
