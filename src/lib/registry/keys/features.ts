// Platform-level entitlement feature catalog.
// Runtime entitlements should come from DB (EntitlementFeature/PlanFeature). This file is optional.
import type { ModuleCode, SubModuleOf, ResourceOf, SubModuleKey, KEYS  } from '@/lib/registry/index'
import type { ActionKey } from '@/lib/registry/keys/actions'



export type ResourceCode = {
  [M in ModuleCode]: { 
    [S in SubModuleOf<M>]: ResourceOf<M, S> 
  }[SubModuleOf<M>]
}[ModuleCode];

export type ResourceKey = {
  [M in ModuleCode]: {
    [S in SubModuleOf<M>]: `${M}.${S}.${ResourceOf<M, S>}`
  }[SubModuleOf<M>]
}[ModuleCode];

export type ResourceType = Uppercase<ResourceCode>;
