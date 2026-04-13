import React from 'react';
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const inputVariants = cva(
  "flex w-full rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2",
  {
    variants: {
      variant: {
        default: "bg-white/90 backdrop-blur-sm border-gray-200/50 focus:border-blue-500 focus:ring-blue-500/20",
        glass: "bg-white/20 backdrop-blur-xl border-white/20 focus:border-blue-400 focus:ring-blue-400/30",
        modern: "bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm focus:shadow-md",
      },
      size: {
        default: "h-10 px-4 py-2.5 text-sm",
        sm: "h-8 px-3 py-1.5 text-xs",
        lg: "h-12 px-5 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const ModernInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, label, error, helperText, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            className={cn(
              inputVariants({ variant, size }),
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {(error || helperText) && (
          <div className="space-y-1">
            {error && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                {error}
              </p>
            )}
            {helperText && (
              <p className="text-xs text-gray-500">
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);
ModernInput.displayName = "ModernInput";

export { ModernInput, inputVariants };
