import React from 'react';
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

// Modern button with glass morphism and animations
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95",
        secondary: "bg-gray-100 text-gray-900 border border-gray-200 hover:bg-gray-200 hover:shadow-md transform hover:scale-105 active:scale-95",
        outline: "border border-gray-200 bg-white/80 backdrop-blur-sm hover:bg-gray-50 hover:shadow-md transform hover:scale-105 active:scale-95",
        ghost: "hover:bg-gray-100 hover:shadow-sm transform hover:scale-105 active:scale-95",
        danger: "bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95",
        success: "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        sm: "h-9 px-3 py-1.5 text-xs",
        lg: "h-11 px-6 py-2.5 text-base",
        xl: "h-12 px-8 py-3 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const ModernButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
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
          children
        )}
      </Comp>
    );
  }
);
ModernButton.displayName = "ModernButton";

export { ModernButton, buttonVariants };
