import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "flex w-full bg-primary text-foreground shadow items-center border-2 border-primary gap-x-1 hover:bg-transparent hover:text-primary",
        destructive:
          "bg-destructive text-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border-2 border-primary bg-transparent text-foreground hover:border-primary hover:bg-primary hover:text-white",
        graphic:
          "border-2 border-foreground bg-transparent text-black hover:border-primary hover:bg-foreground/10",
        secondary:
          "bg-foreground text-primary border-2 border-foreground shadow-sm hover:bg-foreground/10 hover:border-primary hover:text-foreground",
        transparent: "flex w-auto bg-transparent p-0",
        ghost:
          "bg-secondary text-foreground hover:border-primary border-2 hover:border-secondary hover:text-secondary hover:bg-transparent",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: "w-full bg-gradient-to-r from-primary to-foreground text-white hover:opacity-90 ",
        icon:"w-full bg-foreground flex items-center justify-center gap-2 hover:bg-transparent hover:text-primary border-2 border-foreground text-secondary text-xs ",
        void: "flex w-full text-white items-center  gap-x-1  hover:text-primary",
        opaque: "text-white items-center  gap-x-1  hover:text-primary",
        defaultV:"bg-primary text-muted shadow items-center border-2 border-primary gap-x-1 hover:bg-transparent hover:text-primary",
        home:
          "flex w-full bg-primary text-muted shadow items-center border-2 border-primary gap-x-1 hover:bg-transparent hover:text-primary rounded-full",
      },
      size: {
        default: "h-9 px-4 py-2 rounded-xl",
        sm: "w-6/12 h-8 rounded-lg px-3 text-xs",
        lg: "h-10 rounded-lg px-6 gap-x-2",
        xl: "w-full h-14 rounded-full gap-x-5 items-center",
        icon: "h-10 w-16 rounded-full",
        opaque: "h-full w-full rounded-none",
        void: "w-auto h-auto p-0 gap-x-2 items-center",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };