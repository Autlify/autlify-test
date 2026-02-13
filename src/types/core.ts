export type AgencyKind = { kind: 'agency'; agencyId: string }
export type SubAccountKind = { kind: 'subaccount'; subAccountId: string }
export type UserKind = { kind: 'user'; userId: string }
export type GlobalKind = { kind: 'global' }
    
export type Scope = AgencyKind | SubAccountKind

export type IdentityScope = AgencyKind | SubAccountKind | UserKind | GlobalKind

export type ScopeType = Scope['kind']