import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { hasAgencyPermission } from '@/lib/features/iam/authz/permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  Plus,
  ArrowLeftRight,
  TrendingUp,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { 
  listCurrencies, 
  listExchangeRates 
} from '@/lib/features/fi/general-ledger/actions/currency';
import { getGLConfiguration } from '@/lib/features/fi/general-ledger/actions/configuration';

type Props = {
  params: Promise<{ agencyId: string }>;
};

export default async function CurrencyPage({ params }: Props) {
  const { agencyId } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const hasPermission = await hasAgencyPermission(agencyId, 'core.agency.account.read');
  if (!hasPermission) {
    notFound();
  }

  const [configResult, currenciesResult, ratesResult] = await Promise.all([
    getGLConfiguration(),
    listCurrencies(),
    listExchangeRates(),
  ]);

  const config = configResult.success ? configResult.data : null;
  const currenciesData = currenciesResult.success ? currenciesResult.data : null;
  const currencies: any[] = Array.isArray(currenciesData)
    ? currenciesData
    : ((currenciesData as any)?.currencies || []);
  const ratesData = ratesResult.success ? ratesResult.data : null;
  const exchangeRates: any[] = Array.isArray(ratesData)
    ? ratesData
    : ((ratesData as any)?.rates || []);

  const baseCurrency = config?.baseCurrency || 'USD';
  const activeCurrencies = currencies.filter((c: any) => c.isActive);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Currencies & Exchange Rates</h1>
          <p className="text-muted-foreground">
            Manage multi-currency settings and exchange rates
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/agency/${agencyId}/fi/general-ledger/currency/revaluation`}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Revaluation
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/agency/${agencyId}/fi/general-ledger/currency/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Currency
            </Link>
          </Button>
        </div>
      </div>

      {/* Base Currency Info */}
      <Card className="border-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Base Currency
              </CardTitle>
              <CardDescription>
                All transactions are converted to this currency for reporting
              </CardDescription>
            </div>
            <Badge variant="default" className="text-lg">
              {baseCurrency}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Currencies</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCurrencies.length}</div>
            <p className="text-xs text-muted-foreground">
              Available for transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exchange Rates</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exchangeRates.length}</div>
            <p className="text-xs text-muted-foreground">
              Current rate entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {exchangeRates.length > 0
                ? new Date(
                    Math.max(
                      ...exchangeRates.map((r: any) =>
                        new Date(r.effectiveDate || r.updatedAt).getTime()
                      )
                    )
                  ).toLocaleDateString()
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Most recent rate update
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Currencies List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Currencies</CardTitle>
              <CardDescription>
                Manage currencies available for transactions
              </CardDescription>
            </div>
            <Button size="sm" asChild>
              <Link href={`/agency/${agencyId}/fi/general-ledger/currency/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Currency
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {currencies.length > 0 ? (
            <div className="divide-y">
              {currencies.map((currency: any) => (
                <div
                  key={currency.id}
                  className="flex items-center justify-between py-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-bold">
                      {currency.symbol || currency.code?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">
                        {currency.code} - {currency.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Decimal places: {currency.decimalPlaces || 2}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {currency.code === baseCurrency && (
                      <Badge variant="outline">Base Currency</Badge>
                    )}
                    <Badge variant={currency.isActive ? 'default' : 'secondary'}>
                      {currency.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={`/agency/${agencyId}/fi/general-ledger/currency/${currency.id}`}
                      >
                        Edit
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Currencies</h3>
              <p className="text-muted-foreground">
                Add currencies to enable multi-currency transactions.
              </p>
              <Button className="mt-4" asChild>
                <Link href={`/agency/${agencyId}/fi/general-ledger/currency/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Currency
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exchange Rates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Exchange Rates</CardTitle>
              <CardDescription>
                Currency conversion rates for multi-currency transactions
              </CardDescription>
            </div>
            <Button size="sm" asChild>
              <Link href={`/agency/${agencyId}/fi/general-ledger/currency/rates/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Rate
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {exchangeRates.length > 0 ? (
            <div className="divide-y">
              {exchangeRates.slice(0, 10).map((rate: any) => (
                <div
                  key={rate.id}
                  className="flex items-center justify-between py-4"
                >
                  <div className="flex items-center gap-4">
                    <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {rate.fromCurrency} → {rate.toCurrency}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Effective: {new Date(rate.effectiveDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{Number(rate.rate).toFixed(6)}</p>
                    <p className="text-xs text-muted-foreground">
                      {rate.rateType || 'SPOT'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No exchange rates configured
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
