'use server'

import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import Stripe from 'stripe'

type ActionResult<T = void> =
    | { success: true; data: T }
    | { success: false; error: string }

/**
 * Create a SetupIntent for adding a new payment method
 */
export const createSetupIntent = async (
    agencyId?: string,
    subaccountId?: string,
): Promise<ActionResult<{ clientSecret: string }>> => {
    try {
        if (!agencyId && !subaccountId) {
            return { success: false, error: 'Either agencyId or subaccountId is required' }
        }
        // Get customer ID
        const whereClause = agencyId
            ? { id: agencyId }
            : { SubAccount: { some: { id: subaccountId } } }

        const agency = await db.agency.findFirst({
            where: whereClause,
            select: { customerId: true },
        })

        if (!agency?.customerId) {
            return { success: false, error: 'No customer found for this agency or subaccount' }
        }

        // Create SetupIntent for collecting payment method
        const setupIntent = await stripe.setupIntents.create({
            customer: agency.customerId,
            payment_method_types: ['card'],
            usage: 'off_session',
            metadata: {
                agencyId: agencyId || '',
                subaccountId: subaccountId || '',
                source: 'billing-settings',
            },
        })

        if (!setupIntent.client_secret) {
            return { success: false, error: 'Failed to create setup intent' }
        }

        return {
            success: true,
            data: {
                clientSecret: setupIntent.client_secret,
            }
        }
    } catch (error) {
        console.error('Error creating setup intent:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create setup intent'
        }
    }
}


/**
 * Set a payment method as the default for a customer
 */
export const setDefaultPaymentMethod = async (
    agencyId?: string,
        subaccountId?: string,
        paymentMethodId?: string
    ): Promise<ActionResult> => {
        try {
            if (!agencyId && !subaccountId || !paymentMethodId) {
                return { success: false, error: 'Either agencyId or subaccountId is required' }
            }
            // Get customer ID
            const whereClause = agencyId ?
                { id: agencyId } :
                { SubAccount: { some: { id: subaccountId } } }

            const agency = await db.agency.findFirst({
                where: whereClause,
                select: { customerId: true },
            })

            if (!agency?.customerId) {
                return { success: false, error: 'No customer found for this agency or subaccount' }
            }

            // Update the customer's default payment method
            await stripe.customers.update(agency.customerId, {
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                },
            })

            // Revalidate billing page to reflect changes
            revalidatePath(`/${subaccountId ? `subaccount/${subaccountId}` : `agency/${agencyId}`}/billing/payment-methods`)

            return { success: true, data: undefined }
        } catch (error) {
            console.error('Error setting default payment method:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to set default payment method'
            }
        }
    }

    /**
     * Detach (remove) a payment method from a customer
     */
    export const detachPaymentMethod = async (
        agencyId?: string,
        subaccountId?: string,
        paymentMethodId?: string
    ): Promise<ActionResult> => {
        try {
            if (!agencyId && !subaccountId || !paymentMethodId) {
                return { success: false, error: 'Either agencyId or subaccountId is required' }
            }
            // Get customer ID
            const whereClause = agencyId ?
                { id: agencyId } :
                { SubAccount: { some: { id: subaccountId } } }

            const agency = await db.agency.findFirst({
                where: whereClause,
                select: { customerId: true },
            })

            if (!agency?.customerId) {
                return { success: false, error: 'No customer found for this agency or subaccount' }
            }

            // Detach the payment method from the customer
            await stripe.paymentMethods.detach(paymentMethodId)

            // Revalidate billing page to reflect changes
            revalidatePath(`/${subaccountId ? `subaccount/${subaccountId}` : `agency/${agencyId}`}/billing/payment-methods`)

            return { success: true, data: undefined }
        } catch (error) {
            console.error('Error detaching payment method:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to detach payment method'
            }
        }
    }

    /**
     * List payment methods for a customer
     */
    export const listPaymentMethods = async (
        agencyId?: string,
        subaccountId?: string,
        customerId?: string
    ): Promise<ActionResult<Stripe.PaymentMethod[]>> => {
        try {
            if (!agencyId && !subaccountId && !customerId) {
                return { success: false, error: 'Either agencyId, subaccountId, or customerId is required' }
            }
            // Get customer ID
            let customerIdToUse = customerId;
            if (!customerIdToUse) {
              const whereClause = agencyId ?
                  { id: agencyId } :
                  { SubAccount: { some: { id: subaccountId } } }

            const agency = await db.agency.findFirst({
                where: whereClause,
                select: { customerId: true },
            })

            if (!agency?.customerId) {
                return { success: false, error: 'No customer found for this agency or subaccount' }
            }
            customerIdToUse = agency.customerId;
          }

            // List payment methods from Stripe
            const paymentMethods = await stripe.paymentMethods.list({
                customer: customerIdToUse,
                type: 'card',
            })

            return { success: true, data: paymentMethods.data }
        } catch (error) {
            console.error('Error listing payment methods:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to list payment methods'
            }
        }
    }

    /**
     * Get the default payment method for a customer
     */
    export const replacePaymentMethod = async (
        agencyId?: string,
        subaccountId?: string,
        oldPaymentMethodId?: string,
        newPaymentMethodId?: string
    ): Promise<ActionResult> => {
        try {
            if (!agencyId && !subaccountId || !oldPaymentMethodId || !newPaymentMethodId) {
                return { success: false, error: 'Either agencyId or subaccountId is required' }
            }
            // Get customer ID
            const whereClause = agencyId ?
                { id: agencyId } :
                { SubAccount: { some: { id: subaccountId } } }

            const agency = await db.agency.findFirst({
                where: whereClause,
                select: { customerId: true },
            })

            if (!agency?.customerId) {
                return { success: false, error: 'No customer found for this agency or subaccount' }
            }

            // Detach the old payment method
            await stripe.paymentMethods.detach(oldPaymentMethodId)

            // Attach the new payment method to the customer
            await stripe.paymentMethods.attach(newPaymentMethodId, {
                customer: agency.customerId,
            })

            // Optionally, set the new payment method as default
            await stripe.customers.update(agency.customerId, {
                invoice_settings: {
                    default_payment_method: newPaymentMethodId,
                },
            })

            // Revalidate billing page to reflect changes
            const revalidateUrl = revalidatePath(`/${subaccountId ? `subaccount/${subaccountId}` : `agency/${agencyId}`}/billing/payment-methods`)

            return { success: true, data: revalidateUrl }
        } catch (error) {
            console.error('Error replacing payment method:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to replace payment method'
            }
        }
    }   