import React from 'react';
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const cardVariants = cva(
  "rounded-2xl border backdrop-blur-sm transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-white/90 border-gray-200/50 shadow-xl hover:shadow-2xl hover:border-gray-200/70 transform hover:scale-[1.02]",
        glass: "bg-white/20 backdrop-blur-xl border border-white/20 shadow-2xl hover:bg-white/30 hover:shadow-2xl transform hover:scale-[1.02]",
        elevated: "bg-white border-gray-200/50 shadow-2xl hover:shadow-2xl hover:border-gray-200/70 transform hover:scale-[1.02]",
        gradient: "bg-gradient-to-br from-white/90 to-gray-50/90 border border-gray-200/30 shadow-2xl hover:shadow-2xl hover:border-gray-200/50 transform hover:scale-[1.02]",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const ModernCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, className }))}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ModernCard.displayName = "ModernCard";

export { ModernCard, cardVariants };
