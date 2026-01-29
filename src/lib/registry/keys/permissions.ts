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
            team_member: {
                invite: 'core.agency.team_member.invite',
                remove: 'core.agency.team_member.remove',
                manage: 'core.agency.team_member.manage',
            },
            settings: {
                read: 'core.agency.settings.read',
                update: 'core.agency.settings.update',
            },
        },
        billing: {
            account: {
                read: 'core.billing.account.read',
                manage: 'core.billing.account.manage',
            },
            payment_methods: {
                view: 'core.billing.payment_methods.read',
                add: 'core.billing.payment_methods.create',
                remove: 'core.billing.payment_methods.delete',
            },
            subscription: {
                read: 'core.billing.subscription.read',
                update: 'core.billing.subscription.update',
            },
            features: {
                manage: 'core.billing.features.manage',
            },
            usage: {
                read: 'core.billing.usage.read',
                consume: 'core.billing.usage.consume',
            },
            entitlements: {
                read: 'core.billing.entitlements.read',
            },
            credits: {
                read: 'core.billing.credits.read',
            },
        },
        subaccount: {
            account: {
                read: 'core.subaccount.account.read',
                update: 'core.subaccount.account.update',
                delete: 'core.subaccount.account.delete',
            },
            team_member: {
                invite: 'core.subaccount.team_member.invite',
                remove: 'core.subaccount.team_member.remove',
            },
        },
        features: {
            experimental: {
                manage: 'core.features.experimental.manage',
            },
        },
        apps: {
            app: {
                read: 'core.apps.app.read',
                manage: 'core.apps.app.manage',
            },
            integrations: {
                read: 'core.apps.integrations.read',
                manage: 'core.apps.integrations.manage',
            },
            webhooks: {
                read: 'core.apps.webhooks.read',
                manage: 'core.apps.webhooks.manage',
            },
        },
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


export type ModuleCode = keyof typeof KEYS;
export type ModuleKey = ModuleCode;
export type ModuleType = Uppercase<ModuleCode>;

export type SubModuleOf<M extends ModuleCode> = M extends keyof typeof KEYS
    ? Extract<keyof (typeof KEYS)[M], string>
    : never;

export type ResourceOf<M extends ModuleCode, S extends SubModuleOf<M>> = Extract<
    keyof (typeof KEYS)[M][S],
    string
>;

export type ActionOf<
    M extends ModuleCode,
    S extends SubModuleOf<M>,
    R extends ResourceOf<M, S>
> = Extract<keyof (typeof KEYS)[M][S][R], string>;

// Union types for all levels
export type SubModuleCode = {
    [M in ModuleCode]: Extract<keyof (typeof KEYS)[M], string>
}[ModuleCode];

export type SubModuleKey = {
    [M in ModuleCode]: `${M}.${SubModuleOf<M>}`
}[ModuleCode];

export type SubModuleType = Uppercase<SubModuleCode>;
