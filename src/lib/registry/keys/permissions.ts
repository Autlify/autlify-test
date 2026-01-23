/**
 * @abstraction Permission Keys Registry
 * @description This file contains a structured registry of permission keys used throughout the application.
 * Each key is organized hierarchically by module, sub-module, and specific features or actions.
 * This structure facilitates consistent permission management and access control across different parts of the system.
 *
 * @namespace Autlify.Lib.Registry.Keys.Permissions
 * @name Permission Keys Registry
 * @module REGISTRY
 * @author Autlify Team
 * @created 2026-01-15
 * @summary Centralized, Standardized, Normalized permission keys for access control, entitlement features, role management, and authorization checks.
 */


export const KEYS = {
    core: {
        agency: {
            account: {
                read: 'core.agency.account.read',
                update: 'core.agency.account.update',
                delete: 'core.agency.account.delete',
            },
            subaccounts: {
                read: 'core.agency.subaccounts.read',
                update: 'core.agency.subaccounts.update',
                create: 'core.agency.subaccounts.create',
                delete: 'core.agency.subaccounts.delete',
            },
            team_members: {
                invite: 'core.agency.team_members.invite',
                remove: 'core.agency.team_members.remove',
            },
            settings: {
                read: 'core.agency.settings.read',
                update: 'core.agency.settings.update',
            },
        },
        billings: {
            payment_methods: {
                view: 'core.billing.payment_methods.read',
                add: 'core.billing.payment_methods.create',
                remove: 'core.billing.payment_methods.delete',
            },
            subscription: {
                read: 'core.billing.subscription.read',
                update: 'core.billing.subscription.update',
            },
            usage: {
                read: 'core.billing.usage.read'
            }
        },
        subaccount: {
            account: {
                read: 'core.subaccount.account.read',
                update: 'core.subaccount.account.update',
                delete: 'core.subaccount.account.delete',
            },
            team_members: {
                invite: 'core.subaccount.team_members.invite',
                remove: 'core.subaccount.team_members.remove',
            },
        }
    },
    crm: {
        customers: {
            contact: {
                read: 'crm.customers.contact.read',
                update: 'crm.customers.contact.update',
                create: 'crm.customers.contact.create',
                delete: 'crm.customers.contact.delete',
            },
        },
        funnels: {
            content: {
                create: 'crm.funnels.content.create',
                read: 'crm.funnels.content.read',
                update: 'crm.funnels.content.update',
                delete: 'crm.funnels.content.delete',
            }
        },
        pipelines: {
            lane: {
                create: 'crm.pipelines.lane.create',
                read: 'crm.pipelines.lane.read',
                update: 'crm.pipelines.lane.update',
                delete: 'crm.pipelines.lane.delete',
            },
            ticket: {
                create: 'crm.pipelines.ticket.create',
                read: 'crm.pipelines.ticket.read',
                update: 'crm.pipelines.ticket.update',
                delete: 'crm.pipelines.ticket.delete',
            },
            tag: {
                create: 'crm.pipelines.tag.create',
                read: 'crm.pipelines.tag.read',
                update: 'crm.pipelines.tag.update',
                delete: 'crm.pipelines.tag.delete',
            },
        },
    },
} as const;


type LeafValues<T> = T extends string
    ? T
    : T extends Record<string, any>
    ? { [K in keyof T]: LeafValues<T[K]> }[keyof T]
    : never;


export type ModuleKey = keyof typeof KEYS;
export type SubModuleKey = { [M in ModuleKey]: keyof (typeof KEYS)[M] }[ModuleKey];
export type FeatureKey = {
  [M in ModuleKey]: {
    [SM in keyof (typeof KEYS)[M]]: `${M}.${Extract<SM, string>}.${Extract<keyof (typeof KEYS)[M][SM], string>}`
  }[keyof (typeof KEYS)[M]]
}[ModuleKey]; 
export type PermissionKey = LeafValues<typeof KEYS>;
