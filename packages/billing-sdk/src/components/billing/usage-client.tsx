/**
 * Usage Client Component
 * Full-featured usage tracking with filtering, export, and events table
 * @packageDocumentation
 */

"use client";

import * as React from "react";
import {
    Card,
    Badge,
    Button,
    Input,
    Separator,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    CardContent,
} from "../ui";
import { cn } from "../../utils";
import { DetailedUsageTable } from "./detailed-usage-table";

// ============================================================================
// ICONS
// ============================================================================

function RefreshIcon({ className }: { className?: string }) {
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
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
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

function ChevronDownIcon({ className }: { className?: string }) {
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
            <path d="m6 9 6 6 6-6" />
        </svg>
    );
}

function CalendarIcon({ className }: { className?: string }) {
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
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
    );
}

// ============================================================================
// USAGE CLIENT COMPONENT
// ============================================================================

















// ============================================================================
// TYPES
// ============================================================================

export type UsagePeriod = "MONTHLY" | "WEEKLY" | "DAILY" | "YEARLY";

export type UsageRow = {
    featureKey: string;
    currentUsage: string;
    maxAllowed: string | null;
    isUnlimited: boolean;
    period: string;
};

export type UsageEventRow = {
    id: string;
    createdAt: string;
    featureKey: string;
    quantity: string;
    actionKey: string | null;
    idempotencyKey: string;
};

export type UsageWindow = {
    periodStart: string;
    periodEnd: string;
};

export interface UsageClientProps {
    /** Agency ID for fetching usage data */
    agencyId: string;
    /** Optional subaccount ID (scope becomes SUBACCOUNT if provided) */
    subAccountId?: string | null;
    /** Base API URL (defaults to /api/features/core/billing/usage) */
    apiBaseUrl?: string;
    /** Custom fetch function for API calls */
    fetchFn?: typeof fetch;
    /** Callback when data is refreshed */
    onRefresh?: () => void;
    /** Callback when error occurs */
    onError?: (error: Error) => void;
    /** Additional class names */
    className?: string;
    /** Hide the events table */
    hideEvents?: boolean;
    /** Custom empty state message */
    emptyMessage?: string;
}

// ============================================================================
// UTILITIES
// ============================================================================

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = React.useState(value);

    React.useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

function toCsv(rows: Record<string, unknown>[]): string {
    if (!rows.length) return "";
    const firstRow = rows[0];
    if (!firstRow) return "";
    const headers = Object.keys(firstRow);
    const escape = (v: unknown): string => {
        const s = String(v ?? "");
        const needs = /[\n\r,\"]/g.test(s);
        const out = s.replace(/\"/g, '""');
        return needs ? `"${out}"` : out;
    };
    return [
        headers.join(","),
        ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
    ].join("\n");
}

function downloadText(filename: string, text: string): void {
    const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ============================================================================
// SELECT COMPONENT (Minimal inline implementation)
// ============================================================================

interface SelectProps {
    value: string;
    onValueChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
    className?: string;
}

function Select({ value, onValueChange, options, placeholder, className }: SelectProps) {
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find((o) => o.value === value);

    return (
        <div ref={ref} className={cn("relative", className)}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={cn(
                    "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background",
                    "focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                    "hover:bg-accent/5"
                )}
            >
                <span className={!selectedOption ? "text-muted-foreground" : ""}>
                    {selectedOption?.label ?? placeholder ?? "Select..."}
                </span>
                <ChevronDownIcon className="h-4 w-4 opacity-50" />
            </button>
            {open && (
                <div className="absolute top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onValueChange(option.value);
                                setOpen(false);
                            }}
                            className={cn(
                                "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none",
                                "hover:bg-accent hover:text-accent-foreground",
                                value === option.value && "bg-accent/50"
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function UsageClient({
    agencyId,
    subAccountId = null,
    apiBaseUrl = "/api/features/core/billing/usage",
    fetchFn = fetch,
    onRefresh,
    onError,
    className,
    hideEvents = false,
    emptyMessage = "No resources found",
}: UsageClientProps) {
    const scope = subAccountId ? "SUBACCOUNT" : "AGENCY";

    // State
    const [period, setPeriod] = React.useState<UsagePeriod>("MONTHLY");
    const [periodsBack, setPeriodsBack] = React.useState<"0" | "1" | "2">("0");
    const [query, setQuery] = React.useState("");
    const [featureFilter, setFeatureFilter] = React.useState("__ALL__");
    const debouncedQuery = useDebounce(query, 250);

    const [loading, setLoading] = React.useState(true);
    const [loadingEvents, setLoadingEvents] = React.useState(true);
    const [rows, setRows] = React.useState<UsageRow[]>([]);
    const [events, setEvents] = React.useState<UsageEventRow[]>([]);
    const [window, setWindow] = React.useState<UsageWindow | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    // Derived state
    const features = React.useMemo(() => {
        const keys = rows.map((r) => r.featureKey);
        return Array.from(new Set(keys)).sort();
    }, [rows]);

    const filteredRows = React.useMemo(() => {
        const q = debouncedQuery.trim().toLowerCase();
        return rows
            .filter((r) => (featureFilter === "__ALL__" ? true : r.featureKey === featureFilter))
            .filter((r) => (q ? r.featureKey.toLowerCase().includes(q) : true));
    }, [rows, debouncedQuery, featureFilter]);

    const filteredEvents = React.useMemo(() => {
        const q = debouncedQuery.trim().toLowerCase();
        return events
            .filter((e) => (featureFilter === "__ALL__" ? true : e.featureKey === featureFilter))
            .filter((e) =>
                q
                    ? (e.actionKey ?? "").toLowerCase().includes(q) ||
                    e.featureKey.toLowerCase().includes(q)
                    : true
            );
    }, [events, debouncedQuery, featureFilter]);

    const windowLabel = React.useMemo(() => {
        if (!window) return "";
        const s = new Date(window.periodStart).toLocaleDateString();
        const e = new Date(window.periodEnd).toLocaleDateString();
        return `${s} → ${e}`;
    }, [window]);

    // Fetch data
    const refresh = React.useCallback(async () => {
        setError(null);
        setLoading(true);
        setLoadingEvents(true);

        try {
            // Fetch summary
            const summaryUrl = new URL(`${apiBaseUrl}/summary`, globalThis.location?.origin ?? "http://localhost:3000");
            summaryUrl.searchParams.set("agencyId", agencyId);
            if (subAccountId) summaryUrl.searchParams.set("subAccountId", subAccountId);
            summaryUrl.searchParams.set("scope", scope);
            summaryUrl.searchParams.set("period", period);
            summaryUrl.searchParams.set("periodsBack", periodsBack);

            const res = await fetchFn(summaryUrl.toString(), { cache: "no-store" });
            const data = await res.json();

            if (!res.ok || !data?.ok) {
                throw new Error(data?.error || "Failed to load usage summary");
            }

            setRows(data.rows ?? []);
            setWindow(data.window ?? null);
            setLoading(false);

            // Fetch events
            if (!hideEvents) {
                const eventsUrl = new URL(`${apiBaseUrl}/events`, globalThis.location?.origin ?? "http://localhost:3000");
                eventsUrl.searchParams.set("agencyId", agencyId);
                if (subAccountId) eventsUrl.searchParams.set("subAccountId", subAccountId);
                eventsUrl.searchParams.set("scope", scope);
                eventsUrl.searchParams.set("period", period);
                eventsUrl.searchParams.set("periodsBack", periodsBack);

                const evRes = await fetchFn(eventsUrl.toString(), { cache: "no-store" });
                const evData = await evRes.json();

                if (!evRes.ok || !evData?.ok) {
                    throw new Error(evData?.error || "Failed to load usage events");
                }

                setEvents(evData.events ?? []);
            }
            setLoadingEvents(false);
            onRefresh?.();
        } catch (e: unknown) {
            const err = e instanceof Error ? e : new Error(String(e));
            setError(err.message);
            setLoading(false);
            setLoadingEvents(false);
            onError?.(err);
        }
    }, [agencyId, subAccountId, scope, period, periodsBack, apiBaseUrl, fetchFn, hideEvents, onRefresh, onError]);

    React.useEffect(() => {
        refresh();
    }, [refresh]);

    // Export handlers
    const exportSummary = () => {
        const csv = toCsv(
            filteredRows.map((r) => ({
                featureKey: r.featureKey,
                currentUsage: r.currentUsage,
                maxAllowed: r.isUnlimited ? "UNLIMITED" : r.maxAllowed ?? "",
                period: r.period,
            }))
        );
        downloadText(`usage-summary-${period}-${periodsBack}.csv`, csv);
    };

    const exportEvents = () => {
        const csv = toCsv(
            filteredEvents.map((e) => ({
                createdAt: e.createdAt,
                featureKey: e.featureKey,
                quantity: e.quantity,
                actionKey: e.actionKey ?? "",
                idempotencyKey: e.idempotencyKey,
            }))
        );
        downloadText(`usage-events-${period}-${periodsBack}.csv`, csv);
    };

    // Period options
    const periodOptions = [
        { value: "MONTHLY", label: "Monthly" },
        { value: "WEEKLY", label: "Weekly" },
        { value: "DAILY", label: "Daily" },
        { value: "YEARLY", label: "Yearly" },
    ];

    const windowOptions = [
        { value: "0", label: "Current window" },
        { value: "1", label: "Previous window" },
        { value: "2", label: "2 windows back" },
    ];

    const featureOptions = [
        { value: "__ALL__", label: "All features" },
        ...features.map((k) => ({ value: k, label: k })),
    ];

    return (
        <div className={cn("space-y-6", className)}>
            {/* Header Card */}
            <Card className="p-5">
                {/* Title Row */}
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold">Usage</h2>
                            <Badge variant="secondary" className="font-mono text-xs">
                                {scope}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Track feature consumption, overages, and events for the selected billing window.
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="flex gap-2">
                            <Select
                                value={period}
                                onValueChange={(v) => setPeriod(v as UsagePeriod)}
                                options={periodOptions}
                                className="w-[140px]"
                            />
                            <Select
                                value={periodsBack}
                                onValueChange={(v) => setPeriodsBack(v as "0" | "1" | "2")}
                                options={windowOptions}
                                className="w-[170px]"
                            />
                        </div>
                        <Button variant="outline" onClick={refresh} className="gap-2">
                            <RefreshIcon className="h-4 w-4" />
                            Refresh
                        </Button>
                    </div>
                </div>

                <Separator className="my-4" />

                {/* Stats Cards */}
                <CardContent className="space-y-6 px-4 sm:space-y-8 sm:px-6">
                    <div className="space-y-3 sm:space-y-4">
                        <h4 className="flex items-center gap-2 text-base font-medium sm:text-lg">
                            <div className="bg-muted ring-border/50 rounded-md p-1 ring-1 sm:p-1.5">
                                <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                            </div>
                            Billing Information
                        </h4>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6">
                            <div className="group from-muted to-background/10 border-border/30 hover:border-border/60 rounded-lg border bg-gradient-to-b p-2.5 transition-all duration-200 sm:p-3 md:bg-gradient-to-tl">
                                <span className="text-muted-foreground mb-1 block text-xs sm:text-sm">
                                    Tracked features
                                </span>
                                <div className="group-hover:text-primary text-sm font-medium transition-colors duration-200 sm:text-base">
                                    {String(features.length)}
                                </div>
                            </div>
                            <div className="group from-muted to-background/10 border-border/30 hover:border-border/60 rounded-lg border bg-gradient-to-b p-2.5 transition-all duration-200 sm:p-3 md:bg-gradient-to-tr">
                                <span className="text-muted-foreground mb-1 block text-xs sm:text-sm">
                                    Payment method
                                </span>
                                <div className="group-hover:text-primary text-sm font-medium transition-colors duration-200 sm:text-base">
                                    {String(events.length)}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>

                {/* Error Display */}
                {error && (
                    <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                {/* Search & Filter */}
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search feature or action…"
                        className="md:col-span-2"
                    />
                    <Select
                        value={featureFilter}
                        onValueChange={setFeatureFilter}
                        options={featureOptions}
                        placeholder="Filter by feature"
                    />
                </div>

                {/* Export Buttons */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Button
                        variant="secondary"
                        className="gap-2"
                        disabled={loading || filteredRows.length === 0}
                        onClick={exportSummary}
                    >
                        <DownloadIcon className="h-4 w-4" />
                        Export summary
                    </Button>
                    {!hideEvents && (
                        <Button
                            variant="secondary"
                            className="gap-2"
                            disabled={loadingEvents || filteredEvents.length === 0}
                            onClick={exportEvents}
                        >
                            <DownloadIcon className="h-4 w-4" />
                            Export events
                        </Button>
                    )}
                </div>
            </Card>

            {/* Feature Usage Summary Table */}
            <DetailedUsageTable
                title="Feature usage summary"
                description="Detailed breakdown of feature usage"
                resources={filteredRows.map((r) => ({
                    name: r.featureKey || "Unnamed feature",
                    used: r.currentUsage ? Number(r.currentUsage) : 0,
                    limit: r.isUnlimited ? 0 : r.maxAllowed ? Number(r.maxAllowed) : 0,
                    unit: "units",
                }))}
                emptyMessage={emptyMessage}
                isLoading={loading}
            />

            {/* Usage Events Table */}
            {
                !hideEvents && (
                    <Card className="p-5">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Usage events</h3>
                            <Badge
                                variant="outline"
                                className={cn("font-mono text-xs", loadingEvents && "opacity-60")}
                            >
                                {loadingEvents ? "Loading…" : `${filteredEvents.length} rows`}
                            </Badge>
                        </div>

                        <div className="mt-4 overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Feature</TableHead>
                                        <TableHead className="text-right">Qty</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Idempotency</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loadingEvents
                                        ? Array.from({ length: 6 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell>
                                                    <Skeleton className="h-5 w-[140px]" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-5 w-[220px]" />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Skeleton className="ml-auto h-5 w-[80px]" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-5 w-[160px]" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-5 w-[260px]" />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                        : filteredEvents.length === 0
                                            ? (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={5}
                                                        className="py-8 text-center text-muted-foreground"
                                                    >
                                                        No events found
                                                    </TableCell>
                                                </TableRow>
                                            )
                                            : filteredEvents.map((e) => (
                                                <TableRow key={e.id}>
                                                    <TableCell className="text-muted-foreground">
                                                        {new Date(e.createdAt).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs">
                                                        {e.featureKey}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {e.quantity}
                                                    </TableCell>
                                                    <TableCell>
                                                        {e.actionKey ?? (
                                                            <span className="text-muted-foreground">—</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                                        {e.idempotencyKey}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                )
            }
        </div >
    );
}

UsageClient.displayName = "UsageClient";
