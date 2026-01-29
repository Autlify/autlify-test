/**
 * Credit History Component
 * Displays credit transaction history with types and amounts
 * @packageDocumentation
 */

"use client";

import * as React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Badge,
    Button,
} from "../ui";
import { cn, formatDate } from "../../utils";
import type { CreditHistoryProps } from "../types";

// Icons
function HistoryIcon({ className }: { className?: string }) {
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
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M12 7v5l4 2" />
        </svg>
    );
}

function ArrowUpIcon({ className }: { className?: string }) {
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
            <path d="m5 12 7-7 7 7" />
            <path d="M12 19V5" />
        </svg>
    );
}

function ArrowDownIcon({ className }: { className?: string }) {
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
            <path d="M12 5v14" />
            <path d="m19 12-7 7-7-7" />
        </svg>
    );
}

function getTransactionStyles(type: string) {
    switch (type) {
        case "PURCHASE":
        case "BONUS":
            return {
                icon: ArrowUpIcon,
                color: "text-green-500",
                bg: "bg-green-500/10",
                badge: "bg-green-500/10 text-green-500 border-green-500/20",
                sign: "+",
            };
        case "DEDUCTION":
        case "EXPIRY":
            return {
                icon: ArrowDownIcon,
                color: "text-orange-500",
                bg: "bg-orange-500/10",
                badge: "bg-orange-500/10 text-orange-500 border-orange-500/20",
                sign: "-",
            };
        case "REFUND":
            return {
                icon: ArrowUpIcon,
                color: "text-blue-500",
                bg: "bg-blue-500/10",
                badge: "bg-blue-500/10 text-blue-500 border-blue-500/20",
                sign: "+",
            };
        default:
            return {
                icon: ArrowDownIcon,
                color: "text-muted-foreground",
                bg: "bg-muted",
                badge: "bg-muted text-muted-foreground border-muted",
                sign: "",
            };
    }
}

export function CreditHistory({
    transactions,
    showPagination = false,
    pageSize = 10,
    className,
}: CreditHistoryProps) {
    const [currentPage, setCurrentPage] = React.useState(1);

    const paginatedTransactions = showPagination
        ? transactions.slice((currentPage - 1) * pageSize, currentPage * pageSize)
        : transactions;

    const totalPages = Math.ceil(transactions.length / pageSize);

    return (
        <div className={cn("rounded-lg border border-border/50 bg-surface-secondary p-6", className)}>
            <Card className="shadow-lg">
                <CardHeader className="px-4 pb-4 sm:px-6 sm:pb-6">
                    <CardTitle className="flex items-center gap-2 text-lg sm:gap-3 sm:text-xl">
                        <div className="rounded-lg bg-primary/10 p-1.5 ring-1 ring-primary/20 sm:p-2">
                            <HistoryIcon className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                        </div>
                        Credit History
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                        View your credit transactions
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-4 sm:px-6">
                    {paginatedTransactions.length === 0 ? (
                        <div className="rounded-lg border-2 border-dashed bg-muted/10 py-12 text-center">
                            <HistoryIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                            <p className="text-muted-foreground">No transactions yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {paginatedTransactions.map((transaction) => {
                                const styles = getTransactionStyles(transaction.type);
                                const IconComponent = styles.icon;

                                return (
                                    <div
                                        key={transaction.id}
                                        className="flex items-center justify-between rounded-lg border border-border/50 p-4 transition-all duration-200 hover:border-border"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={cn(
                                                    "rounded-lg p-2",
                                                    styles.bg
                                                )}
                                            >
                                                <IconComponent
                                                    className={cn("h-4 w-4", styles.color)}
                                                />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">
                                                        {transaction.description}
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            "text-xs backdrop-blur-sm",
                                                            styles.badge
                                                        )}
                                                    >
                                                        {transaction.type}
                                                    </Badge>
                                                </div>
                                                <div className="mt-1 text-sm text-muted-foreground">
                                                    {formatDate(transaction.createdAt)}
                                                    {transaction.expiresAt && (
                                                        <span className="ml-2 text-xs">
                                                            • Expires {formatDate(transaction.expiresAt)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className={cn(
                                                "text-lg font-semibold tabular-nums",
                                                styles.color
                                            )}
                                        >
                                            {styles.sign}
                                            {Math.abs(transaction.amount).toLocaleString()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {showPagination && totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-between pt-4">
                            <span className="text-sm text-muted-foreground">
                                Page {currentPage} of {totalPages}
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                                    }
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

CreditHistory.displayName = "CreditHistory";
