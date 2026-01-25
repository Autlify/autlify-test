// Platform-level action keys (used for usage metering + auditing).
// Store as constants if you want type-safety; runtime still accepts strings.

import { ModuleCode, SubModuleOf, ResourceOf, ActionOf } from "./permissions"
 

export type ActionCode = {
  [M in ModuleCode]: {
    [S in SubModuleOf<M>]: { 
      [R in ResourceOf<M, S>]: ActionOf<M, S, R> 
    }[ResourceOf<M, S>]
  }[SubModuleOf<M>]
}[ModuleCode];
 

export type ActionKey = {
  [M in ModuleCode]: {
    [S in SubModuleOf<M>]: {
      [R in ResourceOf<M, S>]: `${M}.${S}.${R}.${ActionOf<M, S, R>}`
    }[ResourceOf<M, S>]
  }[SubModuleOf<M>]
}[ModuleCode];

export type ActionType = Uppercase<ActionCode>;