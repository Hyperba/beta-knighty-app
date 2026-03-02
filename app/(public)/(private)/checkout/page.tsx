'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Check,
  Shield,
  Lock,
  CreditCard,
  AlertCircle,
  Zap,
  Star,
  Crown,
  Package,
  Sparkles,
} from 'lucide-react'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { useAuth } from '@/components/contexts/AuthContext'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import styles from './page.module.css'

interface CheckoutPlan {
  id: string
  tier: string
  name: string
  tagline: string
  monthly_price: number
  yearly_price: number
  paypal_plan_id_monthly: string
  paypal_plan_id_yearly: string
  stripe_price_id_monthly: string
  stripe_price_id_yearly: string
  features: { feature_text: string; included: boolean }[]
}

const TIER_ACCENT: Record<string, string> = {
  explorer: '#6b7280',
  access: '#3b82f6',
  builder: '#8b5cf6',
  architect: '#f59e0b',
}

const TIER_ICON: Record<string, React.ReactNode> = {
  access: <Zap size={22} />,
  builder: <Star size={22} />,
  architect: <Crown size={22} />,
  explorer: <Package size={22} />,
}

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, profile, refreshProfile } = useAuth()

  const planTier = searchParams.get('plan') || ''
  const billingPeriod = (searchParams.get('billing') || 'monthly') as 'monthly' | 'yearly'

  const [plan, setPlan] = useState<CheckoutPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [newTier, setNewTier] = useState('')
  const [stripeLoading, setStripeLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe')
  const activatingRef = useRef(false)

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

  // Handle Stripe success redirect
  useEffect(() => {
    const isSuccess = searchParams.get('success') === 'true'
    if (isSuccess && planTier) {
      setNewTier(planTier)
      setSuccess(true)
      setLoading(false)
      refreshProfile()
    }
  }, [searchParams, planTier, refreshProfile])

  // Fetch plan details
  useEffect(() => {
    if (success) return // Don't fetch if we're showing success state

    if (!planTier) {
      setError('No plan selected')
      setLoading(false)
      return
    }

    if (planTier === 'explorer') {
      setError('The free plan does not require checkout')
      setLoading(false)
      return
    }

    if (!['access', 'builder', 'architect'].includes(planTier)) {
      setError('Invalid plan selected')
      setLoading(false)
      return
    }

    let cancelled = false
    const supabase = getSupabaseBrowserClient()

    async function fetchPlan() {
      try {
        const { data, error: rpcError } = await supabase.rpc('get_checkout_plan', {
          p_tier: planTier,
          p_billing_period: billingPeriod,
        })

        if (cancelled) return

        if (rpcError || data?.status !== 'success') {
          setError(data?.message || 'Failed to load plan details')
          setLoading(false)
          return
        }

        setPlan(data.plan)
        setLoading(false)
      } catch {
        if (!cancelled) {
          setError('Failed to load plan details')
          setLoading(false)
        }
      }
    }

    fetchPlan()
    return () => { cancelled = true }
  }, [planTier, billingPeriod])

  // Activate subscription after PayPal approval
  const activateSubscription = useCallback(async (subscriptionId: string) => {
    if (activatingRef.current || !plan) return
    activatingRef.current = true
    setProcessing(true)

    try {
      const res = await fetch('/api/payments/paypal/activate-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId,
          planId: plan.id,
          tier: plan.tier,
          billingPeriod,
        }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || 'Failed to activate subscription')
        setProcessing(false)
        activatingRef.current = false
        return
      }

      // Refresh profile to get new tier
      await refreshProfile()
      setNewTier(plan.tier)
      setSuccess(true)
      setProcessing(false)
    } catch {
      setError('Failed to activate subscription. Please contact support.')
      setProcessing(false)
      activatingRef.current = false
    }
  }, [plan, billingPeriod, refreshProfile])

  // ─── Loading state ─────────────────────────────────────
  if (loading) {
    return (
      <main className={styles.checkout}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} />
          <p className={styles.loadingText}>Loading checkout...</p>
        </div>
      </main>
    )
  }

  // ─── Success state ─────────────────────────────────────
  if (success) {
    return (
      <main className={styles.checkout}>
        <div className={styles.successState}>
          <div className={styles.successIconWrapper}>
            <Check size={32} />
          </div>
          <h1 className={styles.successTitle}>Welcome to {plan?.name}!</h1>
          <p className={styles.successMessage}>
            Your subscription is now active. You have full access to all {plan?.name}-tier 
            builds, guides, and exclusive content.
          </p>
          <span className={styles.successTier}>
            <Sparkles size={16} />
            {newTier.charAt(0).toUpperCase() + newTier.slice(1)} Member
          </span>
          <div className={styles.successActions}>
            <Link href="/builds" className={styles.successBtn}>
              Browse Builds
            </Link>
            <Link href="/settings" className={styles.successBtnSecondary}>
              Account Settings
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // ─── Error state ───────────────────────────────────────
  if (error || !plan) {
    return (
      <main className={styles.checkout}>
        <div className={styles.errorState}>
          <AlertCircle size={48} className={styles.errorIcon} />
          <h2 className={styles.errorTitle}>Checkout Unavailable</h2>
          <p className={styles.errorMessage}>
            {error || 'Could not load plan details. Please try again.'}
          </p>
          <Link href="/pricing" className={styles.errorBtn}>
            <ArrowLeft size={16} />
            Back to Pricing
          </Link>
        </div>
      </main>
    )
  }

  const price = billingPeriod === 'yearly' ? plan.yearly_price : plan.monthly_price
  const paypalPlanId = billingPeriod === 'yearly'
    ? plan.paypal_plan_id_yearly
    : plan.paypal_plan_id_monthly
  const stripePriceId = billingPeriod === 'yearly'
    ? plan.stripe_price_id_yearly
    : plan.stripe_price_id_monthly
  const accent = TIER_ACCENT[plan.tier] || '#8b5cf6'
  const currentTier = profile?.tier || 'free'

  const hasStripe = !!stripePriceId
  const hasPaypal = !!paypalClientId && !!paypalPlanId

  const handleStripeCheckout = async () => {
    if (!stripePriceId || !plan) return
    setStripeLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/payments/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: stripePriceId,
          planId: plan.id,
          tier: plan.tier,
          billingPeriod,
        }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || 'Failed to create checkout session')
        setStripeLoading(false)
        return
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setError('Failed to initiate checkout. Please try again.')
      setStripeLoading(false)
    }
  }

  return (
    <main className={styles.checkout}>
      {/* Processing overlay */}
      {(processing || stripeLoading) && (
        <div className={styles.processingOverlay}>
          <div className={styles.loadingSpinner} />
          <p className={styles.processingText}>
            {stripeLoading ? 'Redirecting to Stripe...' : 'Activating your subscription...'}
          </p>
          <p className={styles.processingSubtext}>Please do not close this page</p>
        </div>
      )}

      <Link href="/pricing" className={styles.backLink}>
        <ArrowLeft size={16} />
        Back to Pricing
      </Link>

      <h1 className={styles.heading}>Checkout</h1>

      <div className={styles.grid}>
        {/* ─── Order Summary ─────────────────────── */}
        <div className={styles.summaryCard}>
          <h2 className={styles.summaryTitle}>Order Summary</h2>

          <div className={styles.summaryPlanHeader}>
            <div className={styles.summaryPlanIcon} style={{ background: accent }}>
              {TIER_ICON[plan.tier] || <Package size={22} />}
            </div>
            <div>
              <h3 className={styles.summaryPlanName}>{plan.name}</h3>
              <p className={styles.summaryPlanTagline}>{plan.tagline}</p>
            </div>
          </div>

          <div className={styles.summaryDetails}>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Plan</span>
              <span className={styles.summaryValue}>{plan.name}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Billing</span>
              <span className={styles.summaryValue}>
                {billingPeriod === 'yearly' ? 'Annual' : 'Monthly'}
              </span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Current tier</span>
              <span className={styles.summaryValue} style={{ textTransform: 'capitalize' }}>
                {currentTier}
              </span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>New tier</span>
              <span className={styles.summaryValue} style={{ color: accent, textTransform: 'capitalize' }}>
                {plan.tier}
              </span>
            </div>
          </div>

          <hr className={styles.summaryDivider} />

          <div className={styles.summaryTotal}>
            <span className={styles.summaryTotalLabel}>Total</span>
            <div>
              <span className={styles.summaryTotalPrice}>${Number(price).toFixed(2)}</span>
              <span className={styles.summaryTotalPeriod}>
                /{billingPeriod === 'yearly' ? 'yr' : 'mo'}
              </span>
            </div>
          </div>

          {billingPeriod === 'yearly' && plan.monthly_price > 0 && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-color)', opacity: 0.5, marginTop: '0.5rem' }}>
              ${(plan.yearly_price / 12).toFixed(2)}/mo billed annually
            </p>
          )}

          {/* Features */}
          {plan.features && plan.features.length > 0 && (
            <div className={styles.summaryFeatures}>
              <h4 className={styles.summaryFeaturesTitle}>Included</h4>
              {plan.features.map((f, i) => (
                <div key={i} className={styles.featureItem}>
                  <Check size={14} className={styles.featureIcon} />
                  <span>{f.feature_text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Payment Section ───────────────────── */}
        <div className={styles.paymentCard}>
          <h2 className={styles.paymentTitle}>Payment Method</h2>

          {/* Payment method tabs */}
          {hasStripe && hasPaypal && (
            <div className={styles.paymentTabs}>
              <button
                type="button"
                className={`${styles.paymentTab} ${paymentMethod === 'stripe' ? styles.paymentTabActive : ''}`}
                onClick={() => setPaymentMethod('stripe')}
              >
                <CreditCard size={16} />
                Card
              </button>
              <button
                type="button"
                className={`${styles.paymentTab} ${paymentMethod === 'paypal' ? styles.paymentTabActive : ''}`}
                onClick={() => setPaymentMethod('paypal')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788l.038-.2.73-4.627.047-.256a.929.929 0 0 1 .917-.789h.578c3.757 0 6.695-1.528 7.552-5.949.36-1.847.174-3.388-.766-4.474z"/>
                </svg>
                PayPal
              </button>
            </div>
          )}

          {/* Stripe payment */}
          {(paymentMethod === 'stripe' || !hasPaypal) && hasStripe && (
            <div className={styles.stripeContainer}>
              <p className={styles.stripeDescription}>
                You&apos;ll be redirected to Stripe&apos;s secure checkout to complete your payment.
              </p>
              <button
                type="button"
                className={styles.stripeBtn}
                onClick={handleStripeCheckout}
                disabled={stripeLoading}
              >
                <CreditCard size={18} />
                {stripeLoading ? 'Redirecting...' : `Pay $${Number(price).toFixed(2)}/${billingPeriod === 'yearly' ? 'yr' : 'mo'}`}
              </button>
            </div>
          )}

          {/* PayPal payment */}
          {(paymentMethod === 'paypal' || !hasStripe) && hasPaypal && (
            <div className={styles.paypalContainer}>
              <PayPalScriptProvider
                options={{
                  clientId: paypalClientId!,
                  intent: 'subscription',
                  vault: true,
                }}
              >
                <PayPalButtons
                  style={{
                    shape: 'rect',
                    color: 'blue',
                    layout: 'vertical',
                    label: 'subscribe',
                  }}
                  createSubscription={(_data, actions) => {
                    return actions.subscription.create({
                      plan_id: paypalPlanId,
                    })
                  }}
                  onApprove={async (data) => {
                    if (data.subscriptionID) {
                      await activateSubscription(data.subscriptionID)
                    }
                  }}
                  onError={(err) => {
                    console.error('PayPal error:', err)
                    setError('Payment failed. Please try again.')
                  }}
                  onCancel={() => {
                    // User closed PayPal popup — do nothing
                  }}
                />
              </PayPalScriptProvider>
            </div>
          )}

          {/* No payment methods available */}
          {!hasStripe && !hasPaypal && (
            <div className={styles.paypalLoading}>
              <AlertCircle size={18} />
              <span>No payment methods are configured for this plan. Please contact support.</span>
            </div>
          )}

          {/* Security note */}
          <div className={styles.securityNote}>
            <Lock size={14} className={styles.securityIcon} />
            <span>
              Your payment is processed securely by {paymentMethod === 'stripe' ? 'Stripe' : 'PayPal'}. We never store your payment details.
            </span>
          </div>
        </div>
      </div>
    </main>
  )
}
