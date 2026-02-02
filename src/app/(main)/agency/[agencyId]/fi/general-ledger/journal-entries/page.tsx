import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { hasAgencyPermission } from '@/lib/features/iam/authz/permissions';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { JournalEntriesTable } from '@/components/fi/general-ledger/journal-entries';
import { listJournalEntries } from '@/lib/features/fi/general-ledger/actions/journal-entries';

type Props = {
  params: Promise<{ agencyId: string }>;
};

export default async function JournalEntriesPage({ params }: Props) {
  const { agencyId } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const hasPermission = await hasAgencyPermission(agencyId, 'fi.general_ledger.journal_entries.read');
  if (!hasPermission) {
    notFound();
  }

  // Get journal entries
  const entriesResult = await listJournalEntries();
  const entries = entriesResult.success ? entriesResult.data : [];

  // Check create permission
  const canCreate = await hasAgencyPermission(agencyId, 'fi.general_ledger.journal_entries.create');

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Journal Entries</h1>
          <p className="text-sm text-muted-foreground">
            Manage journal entries and transactions
          </p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href={`/agency/${agencyId}/fi/general-ledger/journal-entries/new`}>
              <Plus className="mr-2 h-4 w-4" />
              New Entry
            </Link>
          </Button>
        )}
      </div>

      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <JournalEntriesTable entries={entries} agencyId={agencyId} />
      </Suspense>
    </div>
  );
}
