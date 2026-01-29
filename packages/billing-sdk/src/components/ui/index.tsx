'use client';

/**
 * Autlify Billing SDK - UI Primitives
 * 
 * This module provides UI primitive wrappers that can be configured
 * by the consumer to use their own UI components (e.g., shadcn/ui).
 * 
 * For internal use: Components work with Tailwind CSS classes
 * For external use: Consumers inject their UI primitives via BillingProvider
 * 
 * @packageDocumentation
 */

import * as React from "react";
import { cn } from "../../utils";

// ========================================
// UI CONTEXT - For component injection
// ========================================

export interface UIComponents {
    Button?: React.ComponentType<ButtonProps>;
    Card?: React.ComponentType<CardProps>;
    CardHeader?: React.ComponentType<React.HTMLAttributes<HTMLDivElement>>;
    CardTitle?: React.ComponentType<React.HTMLAttributes<HTMLHeadingElement>>;
    CardDescription?: React.ComponentType<React.HTMLAttributes<HTMLParagraphElement>>;
    CardContent?: React.ComponentType<React.HTMLAttributes<HTMLDivElement>>;
    CardFooter?: React.ComponentType<React.HTMLAttributes<HTMLDivElement>>;
    Badge?: React.ComponentType<BadgeProps>;
    Progress?: React.ComponentType<ProgressProps>;
    Separator?: React.ComponentType<React.HTMLAttributes<HTMLDivElement>>;
    Table?: React.ComponentType<React.HTMLAttributes<HTMLTableElement>>;
    TableHeader?: React.ComponentType<React.HTMLAttributes<HTMLTableSectionElement>>;
    TableBody?: React.ComponentType<React.HTMLAttributes<HTMLTableSectionElement>>;
    TableRow?: React.ComponentType<React.HTMLAttributes<HTMLTableRowElement>>;
    TableHead?: React.ComponentType<React.HTMLAttributes<HTMLTableCellElement>>;
    TableCell?: React.ComponentType<React.HTMLAttributes<HTMLTableCellElement>>;
    Dialog?: React.ComponentType<DialogProps>;
    DialogTrigger?: React.ComponentType<React.HTMLAttributes<HTMLButtonElement>>;
    DialogContent?: React.ComponentType<React.HTMLAttributes<HTMLDivElement>>;
    DialogHeader?: React.ComponentType<React.HTMLAttributes<HTMLDivElement>>;
    DialogTitle?: React.ComponentType<React.HTMLAttributes<HTMLHeadingElement>>;
    DialogDescription?: React.ComponentType<React.HTMLAttributes<HTMLParagraphElement>>;
    DialogFooter?: React.ComponentType<React.HTMLAttributes<HTMLDivElement>>;
    Input?: React.ComponentType<InputProps>;
    Label?: React.ComponentType<React.LabelHTMLAttributes<HTMLLabelElement>>;
    Skeleton?: React.ComponentType<React.HTMLAttributes<HTMLDivElement>>;
}

const UIContext = React.createContext<UIComponents>({});

export function UIProvider({
    children,
    components,
}: {
    children: React.ReactNode;
    components?: UIComponents;
}) {
    return (
        <UIContext.Provider value={components || {}}>
            {children}
        </UIContext.Provider>
    );
}

export function useUI(): UIComponents {
    return React.useContext(UIContext);
}

// ========================================
// DEFAULT PRIMITIVES (Tailwind-based)
// ========================================

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        const variants = {
            default: "bg-primary text-primary-foreground hover:bg-primary/90",
            destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            link: "text-primary underline-offset-4 hover:underline",
        };

        const sizes = {
            default: "h-9 px-4 px-5",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-md px-8",
            icon: "h-10 w-10",
        };

        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    variants[variant],
                    sizes[size],
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "rounded-lg border bg-card text-card-foreground shadow-sm",
                className
            )}
            {...props}
        />
    )
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
    />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            "text-2xl font-semibold leading-none tracking-tight",
            className
        )}
        {...props}
    />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center p-6 pt-0", className)}
        {...props}
    />
));
CardFooter.displayName = "CardFooter";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "destructive" | "outline";
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant = "default", ...props }, ref) => {
        const variants = {
            default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
            secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
            destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
            outline: "text-foreground",
        };

        return (
            <div
                ref={ref}
                className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    variants[variant],
                    className
                )}
                {...props}
            />
        );
    }
);
Badge.displayName = "Badge";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: number;
    max?: number;
    indicatorClassName?: string;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
    ({ className, value = 0, max = 100, indicatorClassName, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
                className
            )}
            {...props}
        >
            <div
                className={cn(
                    "h-full w-full flex-1 bg-primary transition-all",
                    indicatorClassName
                )}
                style={{ transform: `translateX(-${100 - (value / max) * 100}%)` }}
            />
        </div>
    )
);
Progress.displayName = "Progress";

export const Separator = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        orientation?: "horizontal" | "vertical";
    }
>(({ className, orientation = "horizontal", ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "shrink-0 bg-border",
            orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
            className
        )}
        {...props}
    />
));
Separator.displayName = "Separator";

// Table components
export const Table = React.forwardRef<
    HTMLTableElement,
    React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
        <table
            ref={ref}
            className={cn("w-full caption-bottom text-sm", className)}
            {...props}
        />
    </div>
));
Table.displayName = "Table";

export const TableHeader = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tbody
        ref={ref}
        className={cn("[&_tr:last-child]:border-0", className)}
        {...props}
    />
));
TableBody.displayName = "TableBody";

export const TableRow = React.forwardRef<
    HTMLTableRowElement,
    React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
    <tr
        ref={ref}
        className={cn(
            "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
            className
        )}
        {...props}
    />
));
TableRow.displayName = "TableRow";

export const TableHead = React.forwardRef<
    HTMLTableCellElement,
    React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <th
        ref={ref}
        className={cn(
            "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
            className
        )}
        {...props}
    />
));
TableHead.displayName = "TableHead";

export const TableCell = React.forwardRef<
    HTMLTableCellElement,
    React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <td
        ref={ref}
        className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
        {...props}
    />
));
TableCell.displayName = "TableCell";

export const TableCaption = React.forwardRef<
    HTMLTableCaptionElement,
    React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
    <caption
        ref={ref}
        className={cn("mt-4 text-sm text-muted-foreground", className)}
        {...props}
    />
));
TableCaption.displayName = "TableCaption";

// Dialog (simplified - consumers should use Radix or their own)
export interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="fixed inset-0 bg-black/80"
                onClick={() => onOpenChange?.(false)}
            />
            <div className="relative z-50 max-h-[90vh] w-full max-w-lg overflow-auto rounded-lg border bg-background p-6 shadow-lg">
                {children}
            </div>
        </div>
    );
}

export const DialogContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("w-full", className)} {...props} />
));
DialogContent.displayName = "DialogContent";

export const DialogHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
        {...props}
    />
));
DialogHeader.displayName = "DialogHeader";

export const DialogTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        className={cn("text-lg font-semibold leading-none tracking-tight", className)}
        {...props}
    />
));
DialogTitle.displayName = "DialogTitle";

export const DialogDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
));
DialogDescription.displayName = "DialogDescription";

export const DialogFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
            className
        )}
        {...props}
    />
));
DialogFooter.displayName = "DialogFooter";

// Input
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => (
        <input
            type={type}
            className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            ref={ref}
            {...props}
        />
    )
);
Input.displayName = "Input";

// Label
export const Label = React.forwardRef<
    HTMLLabelElement,
    React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
    <label
        ref={ref}
        className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            className
        )}
        {...props}
    />
));
Label.displayName = "Label";

// Skeleton
export const Skeleton = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("animate-pulse rounded-md bg-muted", className)}
        {...props}
    />
));
Skeleton.displayName = "Skeleton";
