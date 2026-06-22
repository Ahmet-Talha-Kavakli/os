"use client";

import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/*
  Button — Notion sadeliği. Cam/gradyan yok. İnce, ölçülü.
  variant isimleri korunur (glass artık sade subtle gibi davranır).
*/
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-40 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--color-accent)] text-white hover:brightness-[1.08] shadow-[0_1px_2px_#0000001a]",
        glass:
          "border border-[var(--border)] bg-[var(--bg-raised)] text-[var(--text)] hover:bg-[var(--bg-hover)] shadow-[var(--shadow-soft)]",
        outline:
          "border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg-hover)]",
        subtle: "bg-[var(--bg-hover)] text-[var(--text)] hover:bg-[var(--bg-active)]",
        ghost: "text-[var(--text-dim)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]",
        danger: "bg-[var(--color-health-risk)] text-white hover:brightness-[1.08]",
      },
      size: {
        sm: "h-7 px-2.5 text-[13px]",
        md: "h-8 px-3 text-[13px]",
        lg: "h-10 px-4 text-[15px]",
        icon: "h-8 w-8",
        iconsm: "h-7 w-7",
      },
    },
    defaultVariants: { variant: "subtle", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
  }
);
Button.displayName = "Button";
