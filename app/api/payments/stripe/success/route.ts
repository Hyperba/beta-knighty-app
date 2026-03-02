import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getStripeClient } from '@/lib/payments/stripe'

/**
 * GET /api/payments/stripe/success?session_id=cs_xxx
 *
 * Stripe redirects here after successful checkout.
 * Verifies the session, creates DB records, then redirects to success page.
 * 
 * Note: The webhook also handles subscription activation, so this is a
 * belt-and-suspenders approach. Whichever fires first wins (idempotency_key).
 */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id')
  const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  if (!sessionId) {
    return NextResponse.redirect(`${origin}/pricing?error=missing_session`)
  }

  try {
    // 1. Retrieve the Checkout Session from Stripe
    const checkoutSession = await getStripeClient().checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'subscription.latest_invoice'],
    })

    if (checkoutSession.payment_status !== 'paid' && checkoutSession.status !== 'complete') {
      return NextResponse.redirect(`${origin}/pricing?error=payment_incomplete`)
    }

    // 2. Extract metadata
    const userId = checkoutSession.metadata?.user_id
    const planId = checkoutSession.metadata?.plan_id
    const tier = checkoutSession.metadata?.tier
    const billingPeriod = checkoutSession.metadata?.billing_period

    if (!userId || !planId || !tier || !billingPeriod) {
      console.error('Stripe success: missing metadata', checkoutSession.metadata)
      return NextResponse.redirect(`${origin}/pricing?error=invalid_session`)
    }

    const sub = checkoutSession.subscription as import('stripe').Stripe.Subscription

    if (!sub) {
      return NextResponse.redirect(`${origin}/pricing?error=no_subscription`)
    }

    // 3. Service role client for privileged DB operations
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 4. Create subscription in DB
    // In Stripe SDK v20+, period fields are on subscription items
    const subItem = sub.items.data[0]
    const periodStart = subItem
      ? new Date(subItem.current_period_start * 1000).toISOString()
      : new Date().toISOString()
    const periodEnd = subItem
      ? new Date(subItem.current_period_end * 1000).toISOString()
      : null

    const { data: subResult, error: subError } = await serviceClient.rpc('create_subscription', {
      p_user_id: userId,
      p_plan_id: planId,
      p_tier: tier,
      p_billing_period: billingPeriod,
      p_provider: 'stripe',
      p_provider_subscription_id: sub.id,
      p_provider_plan_id: sub.items.data[0]?.price?.id || '',
      p_period_start: periodStart,
      p_period_end: periodEnd,
    })

    if (subError) {
      console.error('Create subscription RPC error:', subError)
      // Don't fail — webhook will also handle this
    }

    // 5. Record the initial order/payment
    const invoice = sub.latest_invoice as import('stripe').Stripe.Invoice | null
    const amount = invoice?.amount_paid ? invoice.amount_paid / 100 : 0
    const currency = (invoice?.currency || 'usd').toUpperCase()

    if (subResult?.subscription_id) {
      const { error: orderError } = await serviceClient.rpc('record_order', {
        p_user_id: userId,
        p_subscription_id: subResult.subscription_id,
        p_provider: 'stripe',
        p_provider_order_id: invoice?.id || checkoutSession.id,
        p_amount: amount,
        p_currency: currency,
        p_status: 'completed',
        p_plan_tier: tier,
        p_billing_period: billingPeriod,
        p_idempotency_key: `stripe_checkout_${checkoutSession.id}`,
        p_metadata: JSON.stringify({
          stripe_session_id: checkoutSession.id,
          stripe_subscription_id: sub.id,
          stripe_invoice_id: invoice?.id,
        }),
      })

      if (orderError) {
        console.error('Record order RPC error:', orderError)
      }
    }

    // 6. Redirect to success page
    return NextResponse.redirect(
      `${origin}/checkout?plan=${tier}&billing=${billingPeriod}&success=true`
    )
  } catch (error) {
    console.error('Stripe success handler error:', error)
    return NextResponse.redirect(`${origin}/pricing?error=processing_failed`)
  }
}
