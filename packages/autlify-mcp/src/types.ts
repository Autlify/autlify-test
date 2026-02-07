/**
 * Component Registry Types
 * Shared types for all Naropo component registries
 */

export type ComponentCategory =
  | "subscription"
  | "payment"
  | "invoice"
  | "credit"
  | "feedback"
  | "form"
  | "table"
  | "ui"
  | "layout"
  | "navigation"
  | "data-display"
  | "input"
  | "overlay"
  | "feedback"

export interface ComponentFile {
  name: string
  content?: string
}

export interface ComponentRegistry {
  name: string
  description: string
  category: ComponentCategory
  subcategory?: string
  dependencies: string[]
  devDependencies?: string[]
  registryDependencies: string[]
  files: ComponentFile[]
  meta: {
    source: string
    docs: string
    examples?: string[]
  }
}

export interface Registry {
  name: string
  version: string
  description: string
  components: Record<string, ComponentRegistry>
  categories: ComponentCategory[]
}
