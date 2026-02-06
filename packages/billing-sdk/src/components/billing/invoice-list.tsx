/**
 * Invoice List Component
 * Displays invoice history with status badges and download actions
 * @packageDocumentation
 */

"use client";

import * as React from "react";
import {
    Card,
    Badge,
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui";
import { cn } from "../../utils";
import type { InvoiceListProps } from "../types";

// Icons
function FileTextIcon({ className }: { className?: string }) {
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
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" x2="8" y1="13" y2="13" />
            <line x1="16" x2="8" y1="17" y2="17" />
            <line x1="10" x2="8" y1="9" y2="9" />
        </svg>
    );
}

function DownloadIcon({ className }: { className?: string }) {
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
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" x2="12" y1="15" y2="3" />
        </svg>
    );
}

function getStatusColor(status: string): string {
    switch (status) {
        case "paid":
            return "bg-green-500/10 text-green-500 border-green-500/20";
        case "pending":
            return "bg-orange-500/10 text-orange-500 border-orange-500/20";
        case "failed":
            return "bg-destructive/10 text-destructive border-destructive/20";
        case "void":
            return "bg-muted text-muted-foreground border-muted";
        default:
            return "bg-muted text-muted-foreground border-muted";
    }
}

export function InvoiceList({
    invoices,
    onDownload,
    showPagination = false,
    pageSize = 10,
    className,
}: InvoiceListProps) {
    const [currentPage, setCurrentPage] = React.useState(1);

    const paginatedInvoices = showPagination
        ? invoices.slice((currentPage - 1) * pageSize, currentPage * pageSize)
        : invoices;

    const totalPages = Math.ceil(invoices.length / pageSize);

    const handleDownload = (invoice: InvoiceListProps["invoices"][0]) => {
        if (onDownload) {
            onDownload(invoice.id);
        } else if (invoice.downloadUrl) {
            window.open(invoice.downloadUrl, "_blank");
        }
    };

    return (
        <div className={cn("rounded-lg border border-border/50 bg-surface-secondary p-6", className)}>
            <div className="w-full space-y-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 ring-1 ring-primary/20">
                        <FileTextIcon className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">Invoice History</h2>
                </div>

                <Card className="border-border/50 shadow-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedInvoices.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        No invoices found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedInvoices.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="font-medium">
                                            {invoice.date}
                                        </TableCell>
                                        <TableCell>{invoice.description}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    getStatusColor(invoice.status),
                                                    "backdrop-blur-sm"
                                                )}
                                            >
                                                {invoice.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {invoice.amount}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {(invoice.downloadUrl || onDownload) && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDownload(invoice)}
                                                    className="transition-all duration-200 hover:bg-primary/10"
                                                >
                                                    <DownloadIcon className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>

                {/* Pagination */}
                {showPagination && totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4">
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
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

InvoiceList.displayName = "InvoiceList";
