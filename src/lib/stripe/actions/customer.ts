'use server'

import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import Stripe from 'stripe'

export interface CustomerData {
    id: string
    email: string | null
    name: string | null
    phone: string | null
    balance: number
    currency: string | null
    created: number
    defaultPaymentMethodId: string | null
    invoice_settings: {
        default_payment_method: string | null
    }
}

export const getCustomer = async (customerId: string): Promise<CustomerData | null> => {
    try {
        const customer = await stripe.customers.retrieve(customerId, {expand: ['invoice_settings.default_payment_method']}) as Stripe.Customer
        if (customer.deleted) {
            return null
        }
        // Return only serializable plain object data
        const defaultPmId = typeof customer.invoice_settings?.default_payment_method === 'string' 
            ? customer.invoice_settings.default_payment_method 
            : (customer.invoice_settings?.default_payment_method as Stripe.PaymentMethod | null)?.id ?? null
        
        return {
            id: customer.id,
            email: customer.email,
            name: customer.name ?? null,
            phone: customer.phone ?? null,
            balance: customer.balance,
            currency: customer.currency ?? null,
            created: customer.created,
            defaultPaymentMethodId: defaultPmId,
            invoice_settings: {
                default_payment_method: defaultPmId,
            },
        }
    } catch (error) {
        console.error('Error retrieving customer:', error)
        return null
    }
}