/**
 * Error Boundary Component
 * Catches errors in billing components and displays fallback UI
 * @packageDocumentation
 */

"use client";

import * as React from "react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui";
import { cn } from "../../utils";

// Error Icon
function AlertTriangleIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
        </svg>
    );
}

interface BillingErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    onRetry?: () => void;
    title?: string;
    description?: string;
    className?: string;
}

interface BillingErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error boundary specifically designed for billing components.
 * Provides graceful error handling with retry functionality.
 */
export class BillingErrorBoundary extends React.Component<
    BillingErrorBoundaryProps,
    BillingErrorBoundaryState
> {
    constructor(props: BillingErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): BillingErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Billing component error:", error, errorInfo);
        this.props.onError?.(error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
        this.props.onRetry?.();
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <BillingErrorCard
                    error={this.state.error}
                    onRetry={this.handleRetry}
                    title={this.props.title}
                    description={this.props.description}
                    className={this.props.className}
                />
            );
        }

        return this.props.children;
    }
}

/**
 * Standalone error card component for displaying billing errors
 */
export function BillingErrorCard({
    error,
    onRetry,
    title = "Something went wrong",
    description = "We encountered an error loading this billing component. Please try again.",
    className,
}: {
    error?: Error | null;
    onRetry?: () => void;
    title?: string;
    description?: string;
    className?: string;
}) {
    return (
        <div className={cn("rounded-lg border border-border/50 bg-surface-secondary p-6", className)}>
            <Card className="border-destructive/20 bg-destructive/5 shadow-lg">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-destructive">
                        <div className="rounded-lg bg-destructive/10 p-2 ring-1 ring-destructive/20">
                            <AlertTriangleIcon className="h-5 w-5" />
                        </div>
                        {title}
                    </CardTitle>
                    <CardDescription className="text-destructive/80">
                        {description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && process.env.NODE_ENV === "development" && (
                        <div className="rounded-lg bg-muted/50 p-4">
                            <p className="mb-2 text-xs font-medium text-muted-foreground">
                                Error Details (Development Only)
                            </p>
                            <pre className="overflow-x-auto text-xs text-destructive">
                                {error.message}
                            </pre>
                            {error.stack && (
                                <details className="mt-2">
                                    <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                                        Stack trace
                                    </summary>
                                    <pre className="mt-2 overflow-x-auto text-xs text-muted-foreground">
                                        {error.stack}
                                    </pre>
                                </details>
                            )}
                        </div>
                    )}
                    {onRetry && (
                        <Button
                            onClick={onRetry}
                            variant="outline"
                            className="border-destructive/30 text-destructive hover:bg-destructive/10"
                        >
                            Try Again
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

/**
 * Hook for wrapping async billing operations with error handling
 */
export function useBillingErrorHandler() {
    const [error, setError] = React.useState<Error | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const handleOperation = React.useCallback(
        async <T,>(operation: () => Promise<T>): Promise<T | null> => {
            setIsLoading(true);
            setError(null);

            try {
                const result = await operation();
                return result;
            } catch (err) {
                const error = err instanceof Error ? err : new Error(String(err));
                setError(error);
                console.error("Billing operation failed:", error);
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const clearError = React.useCallback(() => {
        setError(null);
    }, []);

    return {
        error,
        isLoading,
        handleOperation,
        clearError,
        hasError: error !== null,
    };
}

BillingErrorCard.displayName = "BillingErrorCard";
