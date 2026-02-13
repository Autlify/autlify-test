/**
 * Document Attachment (contract schema)
 *
 * Generic attachment metadata that can be associated to any FI entity.
 * Storage backend (S3/R2/local) is intentionally not assumed here.
 */

import { z } from 'zod'

export const documentAttachmentSchema = z.object({
  id: z.string().uuid().optional(),

  // Scope
  agencyId: z.string().uuid().optional().nullable(),
  subAccountId: z.string().uuid().optional().nullable(),

  // Link target
  entityType: z.string().min(1).max(80),
  entityId: z.string().min(1).max(64),

  // File metadata
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(120).optional().nullable(),
  sizeBytes: z.number().int().nonnegative().optional().nullable(),

  // Storage pointer
  storageKey: z.string().min(1).max(500),
  url: z.string().url().optional().nullable(),
  checksumSha256: z.string().min(16).max(128).optional().nullable(),

  uploadedBy: z.string().uuid().optional().nullable(),
  uploadedAt: z.coerce.date().optional().nullable(),
})

export type DocumentAttachment = z.infer<typeof documentAttachmentSchema>
