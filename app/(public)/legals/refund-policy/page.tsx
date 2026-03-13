'use client'

import Link from 'next/link'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import styles from '../page.module.css'

export default function RefundPolicyPage() {
  const lastUpdated = 'February 28, 2026'

  return (
    <main className={styles.legalPage}>
      <div className={styles.legalPageInner}>
        <header className={styles.legalPageHeader}>
          <nav className={styles.legalPageBreadcrumb}>
            <Link href="/legals">Legal</Link>
            <ChevronRight size={14} />
            <span>Refund Policy</span>
          </nav>
          <h1 className={styles.legalPageTitle}>Refund Policy</h1>
          <p className={styles.legalPageMeta}>Last updated: {lastUpdated}</p>
        </header>

        <div className={styles.legalContent}>
          <div className={styles.warningBox}>
            <p>
              <strong>All purchases and subscriptions on KnightyBuilds are final.</strong> Due to the digital and instantly accessible nature of our products, we do not offer refunds.
            </p>
          </div>

          <h2>1. No Refunds Policy</h2>
          <p>
            KnightyBuilds provides digital content (Minecraft builds, assets, and guides) that is instantly accessible upon purchase or subscription activation. Because of this immediate delivery and the nature of digital goods, all sales are final.
          </p>
          <p>
            By making a purchase or subscribing, you acknowledge and agree that:
          </p>
          <ul>
            <li>You will not be entitled to a refund for any reason</li>
            <li>You have reviewed the product or subscription details before purchasing</li>
            <li>You understand the digital nature of the content</li>
          </ul>

          <h2>2. Subscriptions</h2>
          <p>
            Subscription payments are non-refundable. This includes:
          </p>
          <ul>
            <li><strong>Initial subscription payments:</strong> The first charge when you subscribe</li>
            <li><strong>Recurring payments:</strong> Monthly or yearly renewal charges</li>
            <li><strong>Upgrade payments:</strong> Charges when upgrading to a higher tier</li>
            <li><strong>Partial periods:</strong> No prorated refunds for unused time</li>
          </ul>

          <h3>Cancellation</h3>
          <p>
            You may cancel your subscription at any time through your <Link href="/settings">account settings</Link>. Upon cancellation:
          </p>
          <ul>
            <li>Your subscription will remain active until the end of your current billing period</li>
            <li>You will retain access to your tier&apos;s content until the period ends</li>
            <li>No refund will be issued for the remaining time</li>
            <li>Auto-renewal will be disabled</li>
          </ul>

          <h2>3. Exceptions</h2>
          <p>
            In rare circumstances, we may consider exceptions at our sole discretion:
          </p>
          <ul>
            <li><strong>Duplicate charges:</strong> If you were charged multiple times for the same subscription due to a technical error</li>
            <li><strong>Unauthorized transactions:</strong> If your account was compromised and unauthorized purchases were made (requires verification)</li>
            <li><strong>Service unavailability:</strong> If the Service is completely unavailable for an extended period</li>
          </ul>
          <p>
            To request an exception review, contact us at <a href="mailto:knighty@knightybuilds.com">knighty@knightybuilds.com</a> with your account details and explanation.
          </p>

          <div className={styles.infoBox}>
            <p>
              <strong>Note:</strong> Exception requests are evaluated on a case-by-case basis. Submitting a request does not guarantee a refund.
            </p>
          </div>

          <h2>4. Chargebacks</h2>
          <p>
            If you initiate a chargeback or payment dispute with your bank or payment provider instead of contacting us first:
          </p>
          <ul>
            <li>Your account may be immediately suspended or terminated</li>
            <li>You will lose access to all downloaded content and subscription benefits</li>
            <li>You may be prohibited from creating future accounts</li>
          </ul>
          <p>
            We encourage you to contact us directly if you have billing concerns. We are happy to review your situation.
          </p>

          <h2>5. Free Tier</h2>
          <p>
            The Explorer tier is free and provides access to free builds. No payment is required, and therefore no refund considerations apply.
          </p>

          <h2>6. Price Changes</h2>
          <p>
            We reserve the right to change subscription prices. If prices increase:
          </p>
          <ul>
            <li>Existing subscribers will be notified in advance</li>
            <li>Price changes will apply to the next billing cycle</li>
            <li>No refunds will be issued for previous payments at old prices</li>
          </ul>

          <h2>7. Contact Us</h2>
          <p>
            If you have questions about this Refund Policy or need to report a billing issue:
          </p>
          <ul>
            <li>Email: <a href="mailto:knighty@knightybuilds.com">knighty@knightybuilds.com</a></li>
            <li>Contact Page: <Link href="/contact">/contact</Link></li>
          </ul>
        </div>

        <footer className={styles.legalFooter}>
          <Link href="/legals" className={styles.backLink}>
            <ArrowLeft size={16} />
            Back to Legal Information
          </Link>
        </footer>
      </div>
    </main>
  )
}
