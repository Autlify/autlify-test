'use client'

import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2, Settings2, X } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import type { EntitlementFeature } from '@/generated/prisma/client'

export function FeatureAdmin() {
  const [features, setFeatures] = useState<EntitlementFeature[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFeature, setSelectedFeature] = useState<EntitlementFeature | null>(null)
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false)
  const [overrideForm, setOverrideForm] = useState({
    isEnabled: true,
    reason: '',
    endsAt: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadFeatures()
  }, [])

  async function loadFeatures() {
    try {
      const response = await fetch('/api/admin/features')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load features')
      }
      
      setFeatures(data.features)
    } catch (error) {
      console.error('Error loading features:', error)
      toast({
        title: 'Error',
        description: 'Failed to load features',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  function openOverrideDialog(feature: EntitlementFeature, enable: boolean) {
    setSelectedFeature(feature)
    setOverrideForm({
      isEnabled: enable,
      reason: '',
      endsAt: '',
    })
    setOverrideDialogOpen(true)
  }

  async function handleOverrideSubmit() {
    if (!selectedFeature) return
    
    setSubmitting(true)
    
    try {
      const response = await fetch('/api/admin/features/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          featureKey: selectedFeature.key,
          ...overrideForm,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create override')
      }
      
      toast({
        title: 'Success',
        description: `Feature override ${overrideForm.isEnabled ? 'enabled' : 'disabled'} successfully`,
      })
      
      setOverrideDialogOpen(false)
      await loadFeatures()
    } catch (error) {
      console.error('Error creating override:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create override',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRemoveOverride(featureKey: string) {
    try {
      const response = await fetch(
        `/api/admin/features/override?featureKey=${encodeURIComponent(featureKey)}`,
        { method: 'DELETE' }
      )
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove override')
      }
      
      toast({
        title: 'Success',
        description: 'Override removed successfully',
      })
      
      await loadFeatures()
    } catch (error) {
      console.error('Error removing override:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove override',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const groupedFeatures = features.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = []
    }
    acc[feature.category].push(feature)
    return acc
  }, {} as Record<string, EntitlementFeature[]>)

  return (
    <>
      <div className="space-y-6">
        {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-lg capitalize">{category}</CardTitle>
              <CardDescription>
                Manage {category} features for your agency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Toggleable</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryFeatures.map((feature) => (
                    <TableRow key={feature.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {feature.displayName || feature.name}
                          </div>
                          {feature.description && (
                            <div className="text-sm text-muted-foreground">
                              {feature.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{feature.valueType}</Badge>
                      </TableCell>
                      <TableCell>
                        {feature.isToggleable ? (
                          <Badge>Yes</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {feature.defaultEnabled ? (
                          <Badge variant="default">Enabled</Badge>
                        ) : (
                          <Badge variant="secondary">Disabled</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openOverrideDialog(feature, true)}
                          >
                            <Settings2 className="h-4 w-4 mr-1" />
                            Enable
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openOverrideDialog(feature, false)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Disable
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {overrideForm.isEnabled ? 'Enable' : 'Disable'} Feature
            </DialogTitle>
            <DialogDescription>
              Create an override for{' '}
              <strong>{selectedFeature?.displayName || selectedFeature?.name}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Textarea
                id="reason"
                placeholder="Why are you changing this feature?"
                value={overrideForm.reason}
                onChange={(e) =>
                  setOverrideForm({ ...overrideForm, reason: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endsAt">Expires At (optional)</Label>
              <Input
                id="endsAt"
                type="datetime-local"
                value={overrideForm.endsAt}
                onChange={(e) =>
                  setOverrideForm({ ...overrideForm, endsAt: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for permanent override
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOverrideDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleOverrideSubmit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {overrideForm.isEnabled ? 'Enable' : 'Disable'} Feature
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
