/**
 * Autlify Component Registries
 * Central index for all component registries
 */

import { billingSDKRegistry, componentNames as billingSDKComponents } from "./billing-sdk.js"
import type { Registry } from "../types.js"

// Billing SDK Registry
export const billingSDK: Registry = {
  name: "billing-sdk",
  version: "0.1.0",
  description: "Premium billing and subscription components",
  components: billingSDKRegistry,
  categories: ["subscription", "payment", "invoice", "credit", "feedback", "form", "table"],
}

// Future registries can be added here:
// export const uiComponents: Registry = { ... }
// export const dataVisualization: Registry = { ... }

// Combined registry for easy access
export const registries = {
  "billing-sdk": billingSDK,
  // Add more registries here as they are created
} as const

export type RegistryName = keyof typeof registries

// Helper to get all components across all registries
export const getAllComponents = () => {
  const all: Array<{ registry: string; component: any }> = []
  
  Object.entries(registries).forEach(([registryName, registry]) => {
    Object.values(registry.components).forEach((component) => {
      all.push({ registry: registryName, component })
    })
  })
  
  return all
}

// Helper to search across all registries
export const searchComponents = (query: string) => {
  const results: Array<{ registry: string; component: any }> = []
  const queryLower = query.toLowerCase()
  
  Object.entries(registries).forEach(([registryName, registry]) => {
    Object.values(registry.components).forEach((component: any) => {
      const text = `${component.name} ${component.description}`.toLowerCase()
      if (text.includes(queryLower)) {
        results.push({ registry: registryName, component })
      }
    })
  })
  
  return results
}

// Export individual registries for direct access
export { billingSDKRegistry, billingSDKComponents }
