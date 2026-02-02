import { RolesClient } from '@/components/features/iam/roles'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { hasAgencyPermission } from '@/lib/features/iam/authz/permissions'
import { listRoles } from '@/lib/features/iam/authz/actions/roles'
import Unauthorized from '@/components/unauthorized'

type Props = {
  params: Promise<{ agencyId: string }>
}

export default async function AgencyRolesPage({ params }: Props) {
  const { agencyId } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/agency/sign-in')
  }

  // TODO: Replace with proper permission check
  const authorized = await hasAgencyPermission(agencyId, 'iam.authZ.roles.read')

  if (!authorized) {
    return <Unauthorized />
  }


  const rolesResult = await listRoles(agencyId)
  const roles = rolesResult.success ? rolesResult.data : []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Role Management</h1>
        <p className="text-muted-foreground">
          Manage roles and permissions for your agency. System roles are read-only.
        </p>
      </div>

      <RolesClient agencyId={agencyId} initialRoles={roles} />
    </div>
  )
}
