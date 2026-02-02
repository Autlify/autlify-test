'use client'

import { useState, useEffect } from 'react'
import {
  type RoleWithPermissions,
  createRole,
  updateRole,
  deleteRole,
  getAvailablePermissions,
  type PermissionInfo,
} from '@/lib/features/iam/authz/actions/roles'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Pencil, Trash2, Shield, Lock, Users, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'

interface RolesClientProps {
  agencyId: string
  initialRoles: RoleWithPermissions[]
}

export function RolesClient({ agencyId, initialRoles }: RolesClientProps) {
  const [roles, setRoles] = useState<RoleWithPermissions[]>(initialRoles)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<RoleWithPermissions | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<RoleWithPermissions | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [formName, setFormName] = useState('')
  const [formPermissionIds, setFormPermissionIds] = useState<string[]>([])
  const [permissionCategories, setPermissionCategories] = useState<
    { category: string; permissions: PermissionInfo[] }[]
  >([])

  // Load permissions for form
  useEffect(() => {
    async function loadPermissions() {
      const result = await getAvailablePermissions({ agencyId })
      if (result.success) {
        setPermissionCategories(result.data)
      }
    }
    loadPermissions()
  }, [])

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (editingRole) {
      setFormName(editingRole.name)
      setFormPermissionIds(editingRole.Permissions.map((p) => p.Permission.id))
    } else {
      setFormName('')
      setFormPermissionIds([])
    }
  }, [editingRole, isDialogOpen])

  const handleOpenCreate = () => {
    setEditingRole(null)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (role: RoleWithPermissions) => {
    setEditingRole(role)
    setIsDialogOpen(true)
  }

  const handleOpenDelete = (role: RoleWithPermissions) => {
    setDeleteTarget(role)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formName.trim()) {
      toast.error('Please enter a role name')
      return
    }
    if (formPermissionIds.length === 0) {
      toast.error('Please select at least one permission')
      return
    }

    setIsLoading(true)
    try {
      if (editingRole) {
        // Update existing role
        const result = await updateRole(editingRole.id, {
          name: formName,
          permissionIds: formPermissionIds,
        })
        if (result.success) {
          setRoles((prev) =>
            prev.map((r) => (r.id === editingRole.id ? result.data : r))
          )
          toast.success('Role updated successfully')
          setIsDialogOpen(false)
        } else {
          toast.error(result.error)
        }
      } else {
        // Create new role
        const result = await createRole(agencyId, {
          name: formName,
          permissionIds: formPermissionIds,
          scope: 'AGENCY',
        })
        if (result.success) {
          setRoles((prev) => [...prev, result.data])
          toast.success('Role created successfully')
          setIsDialogOpen(false)
        } else {
          toast.error(result.error)
        }
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    setIsLoading(true)
    try {
      const result = await deleteRole(deleteTarget.id)
      if (result.success) {
        setRoles((prev) => prev.filter((r) => r.id !== deleteTarget.id))
        toast.success('Role deleted successfully')
        setIsDeleteDialogOpen(false)
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
      setDeleteTarget(null)
    }
  }

  const togglePermission = (permissionId: string) => {
    setFormPermissionIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    )
  }

  const systemRoles = roles.filter((r) => r.isSystem)
  const customRoles = roles.filter((r) => !r.isSystem)
 
  return (
    <div className="space-y-6 w-full h-full">
      {/* System Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Roles
          </CardTitle>
          <CardDescription>
            Predefined roles that cannot be modified. These are shared across all agencies.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Users</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {systemRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      {role.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{role.scope}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {role.Permissions.length} permissions
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {role._count.AgencyMemberships + role._count.SubAccountMemberships}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {systemRoles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No system roles found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Custom Roles */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Custom Roles</CardTitle>
            <CardDescription>
              Agency-specific roles you can create and manage.
            </CardDescription>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Role
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Users</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{role.scope}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {role.Permissions.length} permissions
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {role._count.AgencyMemberships + role._count.SubAccountMemberships}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(role)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDelete(role)}
                        disabled={
                          role._count.AgencyMemberships +
                            role._count.SubAccountMemberships >
                          0
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {customRoles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No custom roles yet. Click &quot;Add Role&quot; to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl  overflow-auto">
          <DialogHeader>
            <DialogTitle>{editingRole ? 'Edit Role' : 'Create Role'}</DialogTitle>
            <DialogDescription>
              {editingRole
                ? 'Modify the role name and permissions.'
                : 'Create a new custom role with specific permissions.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 h-full">
            <div className="space-y-2">
              <Label htmlFor="roleName">Role Name</Label>
              <Input
                id="roleName"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g., Finance Manager"
              />
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              <ScrollArea className="h-64 rounded-md border p-4">
                {permissionCategories.map((category) => (
                  <div key={category.category} className="mb-4">
                    <h4 className="mb-2 font-medium text-sm">{category.category}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {category.permissions.map((perm) => (
                        <div key={perm.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={perm.id}
                            checked={formPermissionIds.includes(perm.id)}
                            onCheckedChange={() => togglePermission(perm.id)}
                          />
                          <Label
                            htmlFor={perm.id}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {perm.key.split('.').pop()}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {permissionCategories.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    Loading permissions...
                  </p>
                )}
              </ScrollArea>
              <p className="text-muted-foreground text-xs">
                Selected: {formPermissionIds.length} permission(s)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingRole ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role &quot;{deleteTarget?.name}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
