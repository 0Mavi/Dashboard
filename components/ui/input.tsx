import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const inputVariants = cva(
	"flex h-10 w-full px-3 py-2 text-foreground ring-offset-background file:bg-transparent file:text-sm file:font-medium placeholder:text-black/50",
	{
		variants: {
			variant: {
				default:
					"flex h-10 w-full border-b-2 border-dashed border-foreground/60 text-foreground bg-transparent px-3 py-2 text-sm file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:border-primary-300 placeholder:text-white",
				secondary:
					"flex h-10 w-full border-b-2 border-dashed border-foreground/60 text-cardForeground bg-transparent px-0 py-2 text-minlight file:bg-transparent file:text-minlight file:font-medium focus-visible:outline-none focus-visible:border-primary-300 placeholder:text-cardForeground",
				formatRegister:
					"flex h-10 w-full rounded-md border-2 border-primary bg-white/5 text-black px-3 py-2 text-sm file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:border-primary-300",
				formatLogin: 
					"flex h-10 w-full rounded-md bg-secondary/40 text-foreground px-3 py-2 text-sm file:bg-transparent file:text-sm file:font-medium focus-visible:outline-primary focus-visible:border-primary", 
				formatRegisterV:
					"flex h-10 w-full rounded-xl border-2 border-primary bg-white/5 text-black px-3 py-2 text-sm file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:border-primary-300",	
				},	
		},
	},
);

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement>,
		VariantProps<typeof inputVariants> {
	titleText?: string | null;
	textColor?: string | null;
	extendingError?: string | null;
	errorColor?: string | null;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	(
		{
			className,
			type,
			titleText,
			textColor,
			extendingError,
			variant,
			errorColor,
			...props
		},
		ref,
	) => {
		return (
			<>
				<p className={`${textColor} text-sm mt-1}>{titleText}`}></p>
				<input
					type={type}
					className={cn(inputVariants({ variant, className }))}
					ref={ref}
					{...props}
				/>
				{extendingError && (
					<p className={`${errorColor} text-sm mt-1}>{extendingError}`}></p>
				)}
			</>
		);
	},
);
Input.displayName = "Input";

export { Input };