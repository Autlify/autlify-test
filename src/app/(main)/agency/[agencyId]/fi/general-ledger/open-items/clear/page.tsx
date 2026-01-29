'use client';

import { useState, useEffect, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { getOpenItems, clearOpenItems } from '@/lib/features/fi/general-ledger/actions/open-items';
import { formatCurrency } from '@/lib/features/fi/general-ledger/utils/helpers';

type OpenItem = {
  id: string;
  sourceReference: string | null;
  reference: string | null;
  accountId: string;
  Account?: { id: string; code: string; name: string };
  documentDate: Date;
  dueDate: Date | null;
  sourceModule: string | null;
  localAmount: number;
  localRemainingAmount: number;
  localCurrencyCode: string;
  status: string;
};

type SelectedItem = {
  item: OpenItem;
  clearAmount: number;
};

export default function ClearOpenItemsPage() {
  const params = useParams();
  const router = useRouter();
  const agencyId = params.agencyId as string;

  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [openItems, setOpenItems] = useState<OpenItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Map<string, SelectedItem>>(new Map());
  const [accountFilter, setAccountFilter] = useState<string>('');
  const [clearingDate, setClearingDate] = useState(new Date().toISOString().split('T')[0]);
  const [clearingReference, setClearingReference] = useState('');

  // Calculate net balance
  const netBalance = Array.from(selectedItems.values()).reduce(
    (sum, { clearAmount }) => sum + clearAmount,
    0
  );

  useEffect(() => {
    loadOpenItems();
  }, [accountFilter]);

  const loadOpenItems = async () => {
    setLoading(true);
    const result = await getOpenItems({
      status: 'OPEN',
      accountId: accountFilter || undefined,
      pageSize: 100,
      page: 1,
      sortBy: 'documentDate',
      sortOrder: 'asc',
      includeZeroBalance: false,
    });

    if (result.success && result.data) {
      setOpenItems(result.data.items || []);
    }
    setLoading(false);
  };

  const toggleItem = (item: OpenItem) => {
    const newSelected = new Map(selectedItems);
    if (newSelected.has(item.id)) {
      newSelected.delete(item.id);
    } else {
      newSelected.set(item.id, {
        item,
        clearAmount: Number(item.localRemainingAmount) || 0,
      });
    }
    setSelectedItems(newSelected);
  };

  const updateClearAmount = (itemId: string, amount: number) => {
    const selected = selectedItems.get(itemId);
    if (selected) {
      const newSelected = new Map(selectedItems);
      newSelected.set(itemId, { ...selected, clearAmount: amount });
      setSelectedItems(newSelected);
    }
  };

  const handleClear = async () => {
    if (selectedItems.size < 2) {
      toast.error('Select at least 2 items to clear');
      return;
    }

    if (Math.abs(netBalance) > 0.01) {
      toast.error(`Net balance must be zero. Current balance: ${formatCurrency(netBalance)}`);
      return;
    }

    startTransition(async () => {
      const result = await clearOpenItems({
        items: Array.from(selectedItems.values()).map(({ item, clearAmount }) => ({
          openItemId: item.id,
          clearAmount,
        })),
        clearingDocumentType: 'CLEARING',
        clearingDate: new Date(clearingDate),
        clearingDocumentNumber: clearingReference || undefined,
        postExchangeDifference: false,
        notes: `Manual clearing via Open Items UI`,
      });

      if (result.success) {
        toast.success(`Successfully cleared ${selectedItems.size} items`);
        router.push(`/agency/${agencyId}/fi/general-ledger/open-items`);
      } else {
        toast.error(result.error || 'Failed to clear items');
      }
    });
  };

  const selectMatching = () => {
    // Auto-select items that can match (debit + credit = 0)
    const debits = openItems.filter(item => Number(item.localRemainingAmount) > 0);
    const credits = openItems.filter(item => Number(item.localRemainingAmount) < 0);
    
    // Simple matching: find pairs with same absolute amount
    const newSelected = new Map<string, SelectedItem>();
    
    for (const debit of debits) {
      const debitAmount = Number(debit.localRemainingAmount);
      const match = credits.find(credit => {
        const creditAmount = Math.abs(Number(credit.localRemainingAmount));
        return Math.abs(debitAmount - creditAmount) < 0.01 && !newSelected.has(credit.id);
      });
      
      if (match) {
        newSelected.set(debit.id, { item: debit, clearAmount: debitAmount });
        newSelected.set(match.id, { item: match, clearAmount: Number(match.localRemainingAmount) });
      }
    }
    
    setSelectedItems(newSelected);
    if (newSelected.size > 0) {
      toast.success(`Found ${newSelected.size / 2} matching pairs`);
    } else {
      toast.info('No matching pairs found');
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/agency/${agencyId}/fi/general-ledger/open-items`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Clear Open Items</h1>
            <p className="text-muted-foreground">
              Select items to clear against each other
            </p>
          </div>
        </div>
      </div>

      {/* Selection Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Clearing Summary</CardTitle>
          <CardDescription>
            Selected items must net to zero to complete clearing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label>Selected Items</Label>
              <p className="text-2xl font-bold">{selectedItems.size}</p>
            </div>
            <div>
              <Label>Total Debits</Label>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  Array.from(selectedItems.values())
                    .filter(({ clearAmount }) => clearAmount > 0)
                    .reduce((sum, { clearAmount }) => sum + clearAmount, 0)
                )}
              </p>
            </div>
            <div>
              <Label>Total Credits</Label>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(
                  Math.abs(
                    Array.from(selectedItems.values())
                      .filter(({ clearAmount }) => clearAmount < 0)
                      .reduce((sum, { clearAmount }) => sum + clearAmount, 0)
                  )
                )}
              </p>
            </div>
            <div>
              <Label>Net Balance</Label>
              <p className={`text-2xl font-bold ${Math.abs(netBalance) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netBalance)}
                {Math.abs(netBalance) < 0.01 && (
                  <CheckCircle className="ml-2 inline h-5 w-5" />
                )}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="clearingDate">Clearing Date</Label>
              <Input
                id="clearingDate"
                type="date"
                value={clearingDate}
                onChange={(e) => setClearingDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="clearingReference">Reference (Optional)</Label>
              <Input
                id="clearingReference"
                placeholder="Clearing reference"
                value={clearingReference}
                onChange={(e) => setClearingReference(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={selectMatching}>
            Auto-Match
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedItems(new Map())}
              disabled={selectedItems.size === 0}
            >
              Clear Selection
            </Button>
            <Button
              onClick={handleClear}
              disabled={isPending || selectedItems.size < 2 || Math.abs(netBalance) > 0.01}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Clear Items
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Open Items List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Open Items</CardTitle>
              <CardDescription>
                Select items to include in clearing
              </CardDescription>
            </div>
            <div className="w-64">
              <Select value={accountFilter} onValueChange={setAccountFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Accounts</SelectItem>
                  {/* Account options would be populated from API */}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : openItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead className="text-right">Clear Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {openItems.map((item) => {
                  const isSelected = selectedItems.has(item.id);
                  const selected = selectedItems.get(item.id);
                  const amount = Number(item.localRemainingAmount) || 0;

                  return (
                    <TableRow 
                      key={item.id}
                      className={isSelected ? 'bg-muted/50' : ''}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleItem(item)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.sourceReference || item.reference || '-'}
                      </TableCell>
                      <TableCell>
                        {item.Account?.code || item.accountId.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        {new Date(item.documentDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.sourceModule}</Badge>
                      </TableCell>
                      <TableCell className={`text-right font-mono ${amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {isSelected && (
                          <Input
                            type="number"
                            step="0.01"
                            className="w-32 text-right"
                            value={selected?.clearAmount || 0}
                            onChange={(e) => updateClearAmount(item.id, parseFloat(e.target.value) || 0)}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Open Items</h3>
              <p className="text-muted-foreground">
                There are no open items available for clearing.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
