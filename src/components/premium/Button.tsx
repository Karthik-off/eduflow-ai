import React from 'react';
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2, Check, AlertCircle, Info, X } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-blue-600/50",
        secondary: "bg-white text-gray-900 border border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md hover:bg-gray-50 transform hover:-translate-y-0.5 active:translate-y-0",
        outline: "border border-gray-200 bg-white/80 backdrop-blur-sm hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0",
        ghost: "hover:bg-gray-100 text-gray-700 hover:shadow-sm transform hover:-translate-y-0.5 active:translate-y-0",
        danger: "bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg hover:shadow-xl hover:shadow-red-500/25 transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-red-600/50",
        success: "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg hover:shadow-xl hover:shadow-green-500/25 transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-green-600/50",
      },
      size: {
        xs: "h-8 px-3 text-xs",
        sm: "h-9 px-4 py-2 text-sm",
        md: "h-10 px-4 py-2.5 text-sm",
        lg: "h-11 px-6 py-3 text-base",
        xl: "h-12 px-8 py-3.5 text-lg",
        "2xl": "h-14 px-10 py-4 text-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <span className="flex items-center gap-2">
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </span>
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
