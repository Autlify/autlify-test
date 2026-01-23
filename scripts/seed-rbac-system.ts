import { db } from '@/lib/db'
import type { Permission } from '@/generated/prisma/client'

// Check for --dry-run flag
const isDryRun = process.argv.includes('--dry-run')

async function main() {
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n')
  }
  
  console.log('🌱 Seeding RBAC system...')

  // Step 1: Create Permissions
  console.log('Creating permissions...')
  
  const permissionDefinitions = [ 
    // Agency permissions
      { key: 'core.agency.account.update', name: 'Create Agency', description: 'Can update existing agencies', category: 'agency' },
      { key: 'core.agency.account.read', name: 'View Agency Account', description: 'Can view agency account and access agency dashboard', category: 'agency' },
      { key: 'core.agency.account.delete', name: 'Delete Agency', description: 'Can delete the agency', category: 'agency' },
      { key: 'core.agency.settings.read', name: 'View Agency Settings', description: 'Can view agency settings', category: 'agency' },
      { key: 'core.agency.settings.update', name: 'Update Agency Settings', description: 'Can modify agency settings', category: 'agency' },
      { key: 'core.agency.team_members.invite', name: 'Invite Members', description: 'Can invite new team members', category: 'agency' },
      { key: 'core.agency.team_members.remove', name: 'Remove Members', description: 'Can remove team members', category: 'agency' },
      { key: 'core.agency.users.create', name: 'Create Agency Users', description: 'Can create and add users to the agency', category: 'agency' },
      // Team Member permissions
      { key: 'core.agency.team_members.invite', name: 'View Team Members', description: 'Can view team members', category: 'agency' },
      { key: 'core.agency.team_members.remove', name: 'Update Team Members', description: 'Can update team member roles and permissions', category: 'agency' },
      // Billing permissions
      { key: 'core.billing.subscription.read', name: 'View Billing', description: 'Can view billing information', category: 'billing' },
      { key: 'core.billing.subscription.update', name: 'Manage Billing', description: 'Can manage billing and subscriptions', category: 'billing' },
      { key: 'core.billing.payment_methods.view', name: 'View Payment Methods', description: 'Can view payment methods', category: 'billing' },
      { key: 'core.billing.payment_methods.add', name: 'Add Payment Methods', description: 'Can add new payment methods', category: 'billing' },
      { key: 'core.billing.payment_methods.remove', name: 'Delete Payment Methods', description: 'Can delete payment methods', category: 'billing' },
      { key: 'core.billing.usage.read', name: 'View Usage', description: 'Can view usage details', category: 'billing' },
    // All-SubAccounts permissions
      { key: 'core.agency.subaccounts.create', name: 'Create SubAccount', description: 'Can create new subaccounts', category: 'subaccount' },
      { key: 'core.agency.subaccounts.read', name: 'View SubAccount', description: 'Can view subaccount details', category: 'subaccount' },
      { key: 'core.agency.subaccounts.update', name: 'Update SubAccount', description: 'Can modify subaccount settings', category: 'subaccount' },
      { key: 'core.agency.subaccounts.delete', name: 'Delete SubAccount', description: 'Can delete subaccounts', category: 'subaccount' },
      // SubAccount permissions
      { key: 'core.subaccount.account.update', name: 'Update SubAccount', description: 'Can update existing subaccounts', category: 'subaccount' },
      { key: 'core.subaccount.account.read', name: 'View SubAccount Account', description: 'Can view subaccount account and access subaccount dashboard', category: 'subaccount' },
      { key: 'core.subaccount.account.delete', name: 'Delete SubAccount', description: 'Can delete the subaccount', category: 'subaccount' },
      // Team Member permissions
      { key: 'core.subaccount.team_members.invite', name: 'Invite SubAccount Members', description: 'Can invite new subaccount team members', category: 'subaccount' },
      { key: 'core.subaccount.team_members.remove', name: 'Remove SubAccount Members', description: 'Can remove subaccount team members', category: 'subaccount' },

    // CRM - Funnel permissions
      { key: 'crm.funnels.content.create', name: 'Create Funnels', description: 'Can create new funnels', category: 'funnel' },
      { key: 'crm.funnels.content.read', name: 'View Funnels', description: 'Can view funnels', category: 'funnel' },
      { key: 'crm.funnels.content.update', name: 'Edit Funnels', description: 'Can edit funnel content', category: 'funnel' },
      { key: 'crm.funnels.content.delete', name: 'Delete Funnels', description: 'Can delete funnels', category: 'funnel' },
      { key: 'crm.funnels.content.publish', name: 'Publish Funnels', description: 'Can publish funnels to production', category: 'funnel' },
    // CRM - Contact permissions
      { key: 'crm.customers.contact.create', name: 'Create Contacts', description: 'Can create new contacts', category: 'contact' },
      { key: 'crm.customers.contact.read', name: 'View Contacts', description: 'Can view contact information', category: 'contact' },
      { key: 'crm.customers.contact.update', name: 'Edit Contacts', description: 'Can edit contact details', category: 'contact' },
      { key: 'crm.customers.contact.delete', name: 'Delete Contacts', description: 'Can delete contacts', category: 'contact' },
    // CRM - Pipeline permissions
      { key: 'crm.pipelines.lane.create', name: 'Create Pipelines', description: 'Can create new pipelines', category: 'pipeline' },
      { key: 'crm.pipelines.lane.read', name: 'View Pipelines', description: 'Can view pipelines', category: 'pipeline' },
      { key: 'crm.pipelines.lane.update', name: 'Edit Pipelines', description: 'Can modify pipeline stages', category: 'pipeline' },
      { key: 'crm.pipelines.lane.delete', name: 'Delete Pipelines', description: 'Can delete pipelines', category: 'pipeline' },
     // CRM - Ticket permissions
      { key: 'crm.pipelines.ticket.create', name: 'Create Tickets', description: 'Can create new support tickets', category: 'ticket' },
      { key: 'crm.pipelines.ticket.read', name: 'View Tickets', description: 'Can view support tickets', category: 'ticket' },
      { key: 'crm.pipelines.ticket.update', name: 'Edit Tickets', description: 'Can modify support tickets', category: 'ticket' },
      { key: 'crm.pipelines.ticket.delete', name: 'Delete Tickets', description: 'Can delete support tickets', category: 'ticket' },
    // CRM - Tag permissions
      { key: 'crm.pipelines.tag.create', name: 'Create Tags', description: 'Can create new tags', category: 'tag' },
      { key: 'crm.pipelines.tag.read', name: 'View Tags', description: 'Can view tags', category: 'tag' },
      { key: 'crm.pipelines.tag.update', name: 'Edit Tags', description: 'Can modify tags', category: 'tag' },



  ]

  const permissions: Permission[] = []
  let createdCount = 0
  let updatedCount = 0
  
  for (const perm of permissionDefinitions) {
    if (isDryRun) {
      // In dry-run, check if exists
      const existing = await db.permission.findUnique({ where: { key: perm.key } })
      if (existing) {
        console.log(`  [DRY RUN] Would update: ${perm.key}`)
        updatedCount++
        permissions.push(existing)
      } else {
        console.log(`  [DRY RUN] Would create: ${perm.key}`)
        createdCount++
        // Create a mock permission for dry-run
        permissions.push({ ...perm, id: 'mock-id', isSystem: true, createdAt: new Date() } as Permission)
      }
    } else {
      const existing = await db.permission.findUnique({ where: { key: perm.key } })
      const permission = await db.permission.upsert({
        where: { key: perm.key },
        update: {
          name: perm.name,
          description: perm.description,
          category: perm.category,
        },
        create: {
          key: perm.key,
          name: perm.name,
          description: perm.description,
          category: perm.category,
          isSystem: true,
        },
      })
      
      if (existing) {
        console.log(`  ♻️  Updated: ${perm.key}`)
        updatedCount++
      } else {
        console.log(`  ✨ Created: ${perm.key}`)
        createdCount++
      }
      permissions.push(permission)
    }
  }

  console.log(`\n✅ Permissions: ${createdCount} created, ${updatedCount} updated`)

  // Step 2: Create System Roles
  console.log('Creating system roles...')

  // Helper function to sync role permissions (prevents duplicates)
  async function syncRolePermissions(roleId: string, permissionKeys: string[], roleName: string) {
    // Get all permissions for the given keys
    const rolePermissions = permissions.filter(p => permissionKeys.includes(p.key))
    
    if (isDryRun) {
      console.log(`    [DRY RUN] Would sync ${rolePermissions.length} permissions for ${roleName}`)
      return rolePermissions.length
    }
    
    // Delete existing permissions not in the new list (cleanup orphaned permissions)
    const deleted = await db.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId: {
          notIn: rolePermissions.map(p => p.id)
        }
      }
    })
    
    if (deleted.count > 0) {
      console.log(`    🗑️  Removed ${deleted.count} orphaned permission(s)`)
    }
    
    // Upsert all permissions (create if not exists, update if exists)
    let createdPerms = 0
    let updatedPerms = 0
    
    for (const permission of rolePermissions) {
      const existing = await db.rolePermission.findUnique({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId: permission.id,
          },
        },
      })
      
      await db.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId: permission.id,
          },
        },
        update: { granted: true },
        create: {
          roleId,
          permissionId: permission.id,
          granted: true,
        },
      })
      
      if (existing) {
        updatedPerms++
      } else {
        createdPerms++
      }
    }
    
    if (createdPerms > 0) console.log(`    ✨ Created ${createdPerms} new permission(s)`)
    if (updatedPerms > 0) console.log(`    ♻️  Updated ${updatedPerms} permission(s)`)
    
    return rolePermissions.length
  }

  // Agency Owner Role - has ALL permissions
  let agencyOwnerRole
  if (isDryRun) {
    const existing = await db.role.findUnique({
      where: {
        agencyId_subAccountId_name: {
          agencyId: '',
          subAccountId: '',
          name: 'AGENCY_OWNER',
        },
      },
    })
    if (existing) {
      console.log(`  [DRY RUN] Would update: AGENCY_OWNER`)
      agencyOwnerRole = existing
    } else {
      console.log(`  [DRY RUN] Would create: AGENCY_OWNER`)
      agencyOwnerRole = { id: 'mock-agency-owner', name: 'AGENCY_OWNER' } as any
    }
  } else {
    const existing = await db.role.findUnique({
      where: {
        agencyId_subAccountId_name: {
          agencyId: '',
          subAccountId: '',
          name: 'AGENCY_OWNER',
        },
      },
    })
    
    agencyOwnerRole = await db.role.upsert({
      where: {
        agencyId_subAccountId_name: {
          agencyId: '',
          subAccountId: '',
          name: 'AGENCY_OWNER',
        },
      },
      update: {},
      create: {
        name: 'AGENCY_OWNER',
        scope: 'AGENCY',
        isSystem: true,
      },
    })
    
    if (existing) {
      console.log(`  ♻️  Updated: AGENCY_OWNER`)
    } else {
      console.log(`  ✨ Created: AGENCY_OWNER`)
    }
  }

  const ownerPermCount = await syncRolePermissions(
    agencyOwnerRole.id,
    permissions.map(p => p.key), // All permissions
    'AGENCY_OWNER'
  )
  console.log(`  ✓ AGENCY_OWNER: ${ownerPermCount} permissions`)

  // Agency Admin Role
  let agencyAdminRole
  if (isDryRun) {
    const existing = await db.role.findUnique({
      where: {
        agencyId_subAccountId_name: {
          agencyId: '',
          subAccountId: '',
          name: 'AGENCY_ADMIN',
        },
      },
    })
    if (existing) {
      console.log(`  [DRY RUN] Would update: AGENCY_ADMIN`)
      agencyAdminRole = existing
    } else {
      console.log(`  [DRY RUN] Would create: AGENCY_ADMIN`)
      agencyAdminRole = { id: 'mock-agency-admin' } as any
    }
  } else {
    const existing = await db.role.findUnique({
      where: {
        agencyId_subAccountId_name: {
          agencyId: '',
          subAccountId: '',
          name: 'AGENCY_ADMIN',
        },
      },
    })
    
    agencyAdminRole = await db.role.upsert({
      where: {
        agencyId_subAccountId_name: {
          agencyId: '',
          subAccountId: '',
          name: 'AGENCY_ADMIN',
        },
      },
      update: {},
      create: {
        name: 'AGENCY_ADMIN',
        scope: 'AGENCY',
        isSystem: true,
      },
    })
    
    if (existing) {
      console.log(`  ♻️  Updated: AGENCY_ADMIN`)
    } else {
      console.log(`  ✨ Created: AGENCY_ADMIN`)
    }
  }

  const adminPermCount = await syncRolePermissions(agencyAdminRole.id, [
    // Core agency permissions
    'core.agency.account.read',
    'core.agency.account.update',
    'core.agency.settings.read',
    'core.agency.settings.update',
    'core.agency.team_members.invite',
    'core.agency.team_members.remove',
    'core.agency.users.create',
    // Billing permissions
    'core.billing.subscription.read',
    'core.billing.payment_methods.view',
    'core.billing.usage.read',
    // SubAccount permissions
    'core.agency.subaccounts.create',
    'core.agency.subaccounts.read',
    'core.agency.subaccounts.update',
    'core.subaccount.account.read',
    'core.subaccount.account.update',
    'core.subaccount.team_members.invite',
    // CRM permissions
    'crm.funnels.content.create',
    'crm.funnels.content.read',
    'crm.funnels.content.update',
    'crm.funnels.content.publish',
    'crm.customers.contact.create',
    'crm.customers.contact.read',
    'crm.customers.contact.update',
    'crm.pipelines.lane.create',
    'crm.pipelines.lane.read',
    'crm.pipelines.lane.update',
    'crm.pipelines.ticket.create',
    'crm.pipelines.ticket.read',
    'crm.pipelines.ticket.update',
    'crm.pipelines.tag.create',
    'crm.pipelines.tag.read',
    'crm.pipelines.tag.update',
  ], 'AGENCY_ADMIN')
  console.log(`  ✓ AGENCY_ADMIN: ${adminPermCount} permissions`)

  // Agency User Role
  let agencyUserRole
  if (isDryRun) {
    const existing = await db.role.findUnique({
      where: {
        agencyId_subAccountId_name: {
          agencyId: '',
          subAccountId: '',
          name: 'AGENCY_USER',
        },
      },
    })
    if (existing) {
      console.log(`  [DRY RUN] Would update: AGENCY_USER`)
      agencyUserRole = existing
    } else {
      console.log(`  [DRY RUN] Would create: AGENCY_USER`)
      agencyUserRole = { id: 'mock-agency-user' } as any
    }
  } else {
    const existing = await db.role.findUnique({
      where: {
        agencyId_subAccountId_name: {
          agencyId: '',
          subAccountId: '',
          name: 'AGENCY_USER',
        },
      },
    })
    
    agencyUserRole = await db.role.upsert({
      where: {
        agencyId_subAccountId_name: {
          agencyId: '',
          subAccountId: '',
          name: 'AGENCY_USER',
        },
      },
      update: {},
      create: {
        name: 'AGENCY_USER',
        scope: 'AGENCY',
        isSystem: true,
      },
    })
    
    if (existing) {
      console.log(`  ♻️  Updated: AGENCY_USER`)
    } else {
      console.log(`  ✨ Created: AGENCY_USER`)
    }
  }

  const userPermCount = await syncRolePermissions(agencyUserRole.id, [
    'core.agency.account.read',
    'core.agency.settings.read',
    'core.subaccount.account.read',
    'crm.funnels.content.read',
    'crm.customers.contact.read',
    'crm.pipelines.lane.read',
    'crm.pipelines.ticket.read',
    'crm.pipelines.tag.read',
  ], 'AGENCY_USER')
  console.log(`  ✓ AGENCY_USER: ${userPermCount} permissions`)

  console.log('✅ Created/Updated 3 agency-level system roles')

  // Step 3: Create SubAccount System Roles
  let subaccountAdminRole
  if (isDryRun) {
    const existing = await db.role.findUnique({
      where: {
        agencyId_subAccountId_name: {
          agencyId: '',
          subAccountId: '',
          name: 'SUBACCOUNT_ADMIN',
        },
      },
    })
    if (existing) {
      console.log(`  [DRY RUN] Would update: SUBACCOUNT_ADMIN`)
      subaccountAdminRole = existing
    } else {
      console.log(`  [DRY RUN] Would create: SUBACCOUNT_ADMIN`)
      subaccountAdminRole = { id: 'mock-subaccount-admin' } as any
    }
  } else {
    const existing = await db.role.findUnique({
      where: {
        agencyId_subAccountId_name: {
          agencyId: '',
          subAccountId: '',
          name: 'SUBACCOUNT_ADMIN',
        },
      },
    })
    
    subaccountAdminRole = await db.role.upsert({
      where: {
        agencyId_subAccountId_name: {
          agencyId: '',
          subAccountId: '',
          name: 'SUBACCOUNT_ADMIN',
        },
      },
      update: {},
      create: {
        name: 'SUBACCOUNT_ADMIN',
        scope: 'SUBACCOUNT',
        isSystem: true,
      },
    })
    
    if (existing) {
      console.log(`  ♻️  Updated: SUBACCOUNT_ADMIN`)
    } else {
      console.log(`  ✨ Created: SUBACCOUNT_ADMIN`)
    }
  }

  const subAdminPermCount = await syncRolePermissions(subaccountAdminRole.id, [
    'subaccount.account.read',
    'subaccount.account.update',
    'subaccount.users.create',
    'funnel.content.create',
    'funnel.content.read',
    'funnel.content.update',
    'funnel.content.delete',
    'funnel.content.publish',
    'contact.data.create',
    'contact.data.read',
    'contact.data.update',
    'contact.data.delete',
    'pipeline.data.create',
    'pipeline.data.read',
    'pipeline.data.update',
    'pipeline.data.delete',
  ], 'SUBACCOUNT_ADMIN')
  console.log(`  ✓ SUBACCOUNT_ADMIN: ${subAdminPermCount} permissions`)

  let subaccountUserRole
  if (isDryRun) {
    const existing = await db.role.findUnique({
      where: {
        agencyId_subAccountId_name: {
          agencyId: '',
          subAccountId: '',
          name: 'SUBACCOUNT_USER',
        },
      },
    })
    if (existing) {
      console.log(`  [DRY RUN] Would update: SUBACCOUNT_USER`)
      subaccountUserRole = existing
    } else {
      console.log(`  [DRY RUN] Would create: SUBACCOUNT_USER`)
      subaccountUserRole = { id: 'mock-subaccount-user' } as any
    }
  } else {
    const existing = await db.role.findUnique({
      where: {
        agencyId_subAccountId_name: {
          agencyId: '',
          subAccountId: '',
          name: 'SUBACCOUNT_USER',
        },
      },
    })
    
    subaccountUserRole = await db.role.upsert({
      where: {
        agencyId_subAccountId_name: {
          agencyId: '',
          subAccountId: '',
          name: 'SUBACCOUNT_USER',
        },
      },
      update: {},
      create: {
        name: 'SUBACCOUNT_USER',
        scope: 'SUBACCOUNT',
        isSystem: true,
      },
    })
    
    if (existing) {
      console.log(`  ♻️  Updated: SUBACCOUNT_USER`)
    } else {
      console.log(`  ✨ Created: SUBACCOUNT_USER`)
    }
  }

  const subUserPermCount = await syncRolePermissions(subaccountUserRole.id, [
    'subaccount.account.read',
    'funnel.content.read',
    'funnel.content.update',
    'contact.data.create',
    'contact.data.read',
    'contact.data.update',
    'pipeline.data.read',
    'pipeline.data.update',
  ], 'SUBACCOUNT_USER')
  console.log(`  ✓ SUBACCOUNT_USER: ${subUserPermCount} permissions`)

  let subaccountGuestRole
  if (isDryRun) {
    const existing = await db.role.findUnique({
      where: {
        agencyId_subAccountId_name: {
          agencyId: '',
          subAccountId: '',
          name: 'SUBACCOUNT_GUEST',
        },
      },
    })
    if (existing) {
      console.log(`  [DRY RUN] Would update: SUBACCOUNT_GUEST`)
      subaccountGuestRole = existing
    } else {
      console.log(`  [DRY RUN] Would create: SUBACCOUNT_GUEST`)
      subaccountGuestRole = { id: 'mock-subaccount-guest' } as any
    }
  } else {
    const existing = await db.role.findUnique({
      where: {
        agencyId_subAccountId_name: {
          agencyId: '',
          subAccountId: '',
          name: 'SUBACCOUNT_GUEST',
        },
      },
    })
    
    subaccountGuestRole = await db.role.upsert({
      where: {
        agencyId_subAccountId_name: {
          agencyId: '',
          subAccountId: '',
          name: 'SUBACCOUNT_GUEST',
        },
      },
      update: {},
      create: {
        name: 'SUBACCOUNT_GUEST',
        scope: 'SUBACCOUNT',
        isSystem: true,
      },
    })
    
    if (existing) {
      console.log(`  ♻️  Updated: SUBACCOUNT_GUEST`)
    } else {
      console.log(`  ✨ Created: SUBACCOUNT_GUEST`)
    }
  }

  const subGuestPermCount = await syncRolePermissions(subaccountGuestRole.id, [
    'subaccount.account.read',
    'funnel.content.read',
    'contact.data.read',
    'pipeline.data.read',
  ], 'SUBACCOUNT_GUEST')
  console.log(`  ✓ SUBACCOUNT_GUEST: ${subGuestPermCount} permissions`)

  console.log('✅ Created/Updated 3 subaccount-level system roles')

  if (isDryRun) {
    console.log('\n🎉 DRY RUN completed - no changes were made')
    console.log('💡 Run without --dry-run to apply changes')
  } else {
    console.log('\n🎉 RBAC system seeded successfully!')
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding RBAC system:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
