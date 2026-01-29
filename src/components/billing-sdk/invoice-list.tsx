"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Invoice {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: "paid" | "pending" | "failed";
  downloadUrl?: string;
}

export interface InvoiceListProps {
  invoices: Invoice[];
  className?: string;
}

export function InvoiceList({ invoices, className }: InvoiceListProps) {
  const getStatusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "pending":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "failed":
        return "bg-destructive/10 text-destructive border-destructive/20";
    }
  };

  return (
    <div className="rounded-lg border border-border/50 bg-surface-secondary p-6">
      <div className={cn("w-full space-y-4", className)}>
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2 ring-1 ring-primary/20">
          <FileText className="h-5 w-5 text-primary" />
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
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No invoices found
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.date}</TableCell>
                  <TableCell>{invoice.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(getStatusColor(invoice.status), "backdrop-blur-sm")}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{invoice.amount}</TableCell>
                  <TableCell className="text-right">
                    {invoice.downloadUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(invoice.downloadUrl, "_blank")}
                        className="transition-all duration-200 hover:bg-primary/10"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
      </div>
    </div>
  );
}
