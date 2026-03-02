import { NextRequest, NextResponse } from 'next/server'
import { createStripeCheckoutSession } from '@/lib/payments/stripe'
import { getSupabaseServerClient } from '@/lib/supabase/server'

/**
 * POST /api/payments/stripe/create-checkout-session
 *
 * Creates a Stripe Checkout Session for a subscription.
 * Returns the session URL to redirect the user to.
 *
 * Body: { priceId, planId, tier, billingPeriod }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user via session
    const supabase = await getSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // 2. Parse and validate body
    const body = await request.json()
    const { priceId, planId, tier, billingPeriod } = body

    if (!priceId || !planId || !tier || !billingPeriod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['monthly', 'yearly'].includes(billingPeriod)) {
      return NextResponse.json({ error: 'Invalid billing period' }, { status: 400 })
    }

    if (!['access', 'builder', 'architect'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    // 3. Build URLs
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const successUrl = `${origin}/api/payments/stripe/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${origin}/checkout?plan=${tier}&billing=${billingPeriod}`

    // 4. Create Stripe Checkout Session
    const checkoutSession = await createStripeCheckoutSession({
      priceId,
      userId: session.user.id,
      userEmail: session.user.email || '',
      planId,
      tier,
      billingPeriod,
      successUrl,
      cancelUrl,
    })

    if (!checkoutSession.url) {
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
    }

    return NextResponse.json({
      status: 'success',
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    })
  } catch (error) {
    console.error('Stripe create checkout session error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
