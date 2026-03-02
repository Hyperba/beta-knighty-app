import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { constructStripeEvent } from '@/lib/payments/stripe'
import type Stripe from 'stripe'

/**
 * POST /api/webhooks/stripe
 *
 * Handles Stripe webhook events for subscription lifecycle.
 * Uses service_role for DB writes. Verifies webhook signature.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured')
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }

    // 1. Verify webhook signature
    let event: Stripe.Event
    try {
      event = constructStripeEvent(rawBody, signature, webhookSecret)
    } catch (err) {
      console.error('Stripe webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // 2. Service role client for privileged operations
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 3. Handle event types
    switch (event.type) {
      case 'checkout.session.completed': {
        // This is handled by the success redirect route as well (belt-and-suspenders)
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.mode !== 'subscription') break

        const userId = session.metadata?.user_id
        const planId = session.metadata?.plan_id
        const tier = session.metadata?.tier
        const billingPeriod = session.metadata?.billing_period

        if (!userId || !planId || !tier || !billingPeriod) {
          console.error('Stripe webhook: missing metadata on checkout.session.completed')
          break
        }

        // Check if subscription already exists (success route may have created it)
        const subId = typeof session.subscription === 'string' 
          ? session.subscription 
          : session.subscription?.id

        if (!subId) break

        const { data: existingSub } = await serviceClient
          .from('subscriptions')
          .select('id')
          .eq('provider_subscription_id', subId)
          .maybeSingle()

        if (existingSub) {
          // Already handled by success redirect
          break
        }

        // Create subscription (fallback if success route didn't fire)
        await serviceClient.rpc('create_subscription', {
          p_user_id: userId,
          p_plan_id: planId,
          p_tier: tier,
          p_billing_period: billingPeriod,
          p_provider: 'stripe',
          p_provider_subscription_id: subId,
          p_provider_plan_id: '',
          p_period_start: new Date().toISOString(),
          p_period_end: null,
        })

        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        // In Stripe SDK v20+, subscription is under parent.subscription_details
        const subDetails = invoice.parent?.subscription_details
        const subId = typeof subDetails?.subscription === 'string'
          ? subDetails.subscription
          : subDetails?.subscription?.id

        if (!subId) break

        // Find the subscription in our DB
        const { data: sub } = await serviceClient
          .from('subscriptions')
          .select('id, user_id, tier, billing_period')
          .eq('provider_subscription_id', subId)
          .maybeSingle()

        if (!sub) break

        // Update subscription period from invoice period
        const periodStart = invoice.period_start
          ? new Date(invoice.period_start * 1000).toISOString()
          : null
        const periodEnd = invoice.period_end
          ? new Date(invoice.period_end * 1000).toISOString()
          : null

        if (periodStart || periodEnd) {
          await serviceClient.rpc('update_subscription_status', {
            p_provider_subscription_id: subId,
            p_status: 'active',
            p_period_start: periodStart,
            p_period_end: periodEnd,
          })
        }

        // Record the payment
        await serviceClient.rpc('record_order', {
          p_user_id: sub.user_id,
          p_subscription_id: sub.id,
          p_provider: 'stripe',
          p_provider_order_id: invoice.id || '',
          p_amount: (invoice.amount_paid || 0) / 100,
          p_currency: (invoice.currency || 'usd').toUpperCase(),
          p_status: 'completed',
          p_plan_tier: sub.tier,
          p_billing_period: sub.billing_period,
          p_idempotency_key: `stripe_invoice_${invoice.id}`,
          p_metadata: JSON.stringify({
            stripe_invoice_id: invoice.id,
            stripe_subscription_id: subId,
            event_type: event.type,
          }),
        })

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subDetails = invoice.parent?.subscription_details
        const subId = typeof subDetails?.subscription === 'string'
          ? subDetails.subscription
          : subDetails?.subscription?.id

        if (!subId) break

        await serviceClient.rpc('update_subscription_status', {
          p_provider_subscription_id: subId,
          p_status: 'past_due',
        })

        // Record the failed payment
        const { data: sub } = await serviceClient
          .from('subscriptions')
          .select('id, user_id, tier, billing_period')
          .eq('provider_subscription_id', subId)
          .maybeSingle()

        if (sub) {
          await serviceClient.rpc('record_order', {
            p_user_id: sub.user_id,
            p_subscription_id: sub.id,
            p_provider: 'stripe',
            p_provider_order_id: invoice.id || '',
            p_amount: (invoice.amount_due || 0) / 100,
            p_currency: (invoice.currency || 'usd').toUpperCase(),
            p_status: 'failed',
            p_plan_tier: sub.tier,
            p_billing_period: sub.billing_period,
            p_idempotency_key: `stripe_invoice_failed_${invoice.id}`,
            p_metadata: JSON.stringify({
              stripe_invoice_id: invoice.id,
              stripe_subscription_id: subId,
              event_type: event.type,
            }),
          })
        }

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const subItem = subscription.items.data[0]

        const status = subscription.status === 'active' ? 'active'
          : subscription.status === 'past_due' ? 'past_due'
          : subscription.status === 'canceled' ? 'cancelled'
          : subscription.status === 'unpaid' ? 'suspended'
          : null

        if (status) {
          await serviceClient.rpc('update_subscription_status', {
            p_provider_subscription_id: subscription.id,
            p_status: status,
            p_period_start: subItem
              ? new Date(subItem.current_period_start * 1000).toISOString()
              : null,
            p_period_end: subItem
              ? new Date(subItem.current_period_end * 1000).toISOString()
              : null,
            p_cancel_at_period_end: subscription.cancel_at_period_end,
          })
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        await serviceClient.rpc('update_subscription_status', {
          p_provider_subscription_id: subscription.id,
          p_status: 'cancelled',
        })

        break
      }

      default:
        // Unhandled event type — acknowledge but do nothing
        break
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json({ status: 'error' }, { status: 200 })
  }
}
