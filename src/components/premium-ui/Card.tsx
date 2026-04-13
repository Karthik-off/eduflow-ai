import React from 'react';
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { X } from 'lucide-react';

const cardVariants = cva(
  "rounded-2xl border backdrop-blur-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-white/90 border-gray-200/50 shadow-lg hover:shadow-xl hover:border-gray-300/70 transform hover:scale-[1.02] hover:-translate-y-1",
        elevated: "bg-white border-gray-200/50 shadow-xl hover:shadow-2xl hover:border-gray-300/70 transform hover:scale-[1.02] hover:-translate-y-1",
        glass: "bg-white/20 backdrop-blur-xl border-white/20 shadow-xl hover:bg-white/30 hover:border-white/30 transform hover:scale-[1.02] hover:-translate-y-1",
        gradient: "bg-gradient-to-br from-white via-gray-50 to-blue-50/30 border border-gray-200/30 shadow-xl hover:shadow-2xl hover:border-gray-200/50 transform hover:scale-[1.02] hover:-translate-y-1",
        success: "bg-gradient-to-br from-green-50/20 to-emerald-50/10 border border-green-200/30 shadow-xl",
        warning: "bg-gradient-to-br from-yellow-50/20 to-orange-50/10 border border-orange-200/30 shadow-xl",
        error: "bg-gradient-to-br from-red-50/20 to-pink-50/10 border border-red-200/30 shadow-xl",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
);

const headerVariants = cva(
  "flex items-center justify-between pb-4 border-b border-gray-200/50",
  {
    variants: {
      size: {
        sm: "px-4 py-3",
        md: "px-6 py-4",
        lg: "px-8 py-5",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export interface CardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof headerVariants> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
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
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, size, title, subtitle, action, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(headerVariants({ size, className }))}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
        {children}
      </div>
    );
  }
);
CardHeader.displayName = "CardHeader";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("p-6", className)}
        {...props}
      />
    );
  }
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("px-6 pb-6 pt-4 border-t border-gray-200/50", className)}
        {...props}
      />
    );
  }
);
CardFooter.displayName = "CardFooter";

// Alert component
const alertVariants = cva(
  "rounded-xl border p-4 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-white border-gray-200 text-gray-900",
        info: "bg-blue-50 border-blue-200 text-blue-900",
        success: "bg-green-50 border-green-200 text-green-900",
        warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
        error: "bg-red-50 border-red-200 text-red-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, title, description, icon, onClose, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(alertVariants({ variant, className }))}
        {...props}
      >
        <div className="flex items-start gap-3">
          {icon && (
            <div className="flex-shrink-0 mt-0.5">
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className="text-sm font-semibold mb-1">
                {title}
              </h4>
            )}
            {description && (
              <p className="text-sm text-gray-600">
                {description}
              </p>
            )}
            {children}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }
);
Alert.displayName = "Alert";

export { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter, 
  alertVariants, 
  Alert 
};
