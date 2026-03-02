import { NextRequest, NextResponse } from 'next/server'
import { cancelStripeSubscription } from '@/lib/payments/stripe'
import { getSupabaseServerClient } from '@/lib/supabase/server'

/**
 * POST /api/payments/stripe/cancel-subscription
 *
 * Cancels the user's active Stripe subscription:
 *   1. Calls cancel_user_subscription RPC (marks cancel_at_period_end = true in DB)
 *   2. Cancels the subscription on Stripe's side (at period end)
 *
 * Body: { reason?: string }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user via session
    const supabase = await getSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // 2. Parse optional reason (unused by Stripe but kept for consistency)
    try {
      await request.json()
    } catch {
      // Empty body is fine
    }

    // 3. Mark subscription for cancellation in DB
    const { data: rpcResult, error: rpcError } = await supabase.rpc('cancel_user_subscription')

    if (rpcError) {
      console.error('cancel_user_subscription RPC error:', rpcError)
      return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 })
    }

    if (rpcResult?.status === 'error') {
      return NextResponse.json({ error: rpcResult.message }, { status: 400 })
    }

    // 4. Cancel on Stripe's side (at period end)
    const providerSubId = rpcResult?.provider_subscription_id
    if (providerSubId) {
      try {
        await cancelStripeSubscription(providerSubId)
      } catch (err) {
        console.error('Stripe cancel failed:', err)
        // DB is already marked — Stripe webhook will also handle this
      }
    }

    return NextResponse.json({
      status: 'success',
      current_period_end: rpcResult?.current_period_end,
      message: 'Subscription will be cancelled at the end of the current billing period',
    })
  } catch (error) {
    console.error('Cancel Stripe subscription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
