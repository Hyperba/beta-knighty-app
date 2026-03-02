'use client'

import Link from 'next/link'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import styles from '../page.module.css'

export default function PrivacyPolicyPage() {
  const lastUpdated = 'February 28, 2026'

  return (
    <main className={styles.legalPage}>
      <div className={styles.legalPageInner}>
        <header className={styles.legalPageHeader}>
          <nav className={styles.legalPageBreadcrumb}>
            <Link href="/legals">Legal</Link>
            <ChevronRight size={14} />
            <span>Privacy Policy</span>
          </nav>
          <h1 className={styles.legalPageTitle}>Privacy Policy</h1>
          <p className={styles.legalPageMeta}>Last updated: {lastUpdated}</p>
        </header>

        <div className={styles.legalContent}>
          <h2>1. Introduction</h2>
          <p>
            KnightyBuilds (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
          </p>

          <h2>2. Information We Collect</h2>
          
          <h3>2.1 Information You Provide</h3>
          <p>We collect information you voluntarily provide when you:</p>
          <ul>
            <li><strong>Create an account:</strong> Email address, handle (username), display name, Minecraft IGN (optional)</li>
            <li><strong>Subscribe to a plan:</strong> Payment information (processed securely by Stripe/PayPal — we do not store full payment details)</li>
            <li><strong>Contact us:</strong> Name, email, and message content</li>
            <li><strong>Subscribe to newsletter:</strong> Email address</li>
            <li><strong>Leave reviews:</strong> Review content and rating</li>
          </ul>

          <h3>2.2 Information Collected Automatically</h3>
          <p>When you use our Service, we may automatically collect:</p>
          <ul>
            <li><strong>Device information:</strong> Browser type, operating system, device type</li>
            <li><strong>Usage data:</strong> Pages visited, time spent, click patterns</li>
            <li><strong>IP address:</strong> Used for security, rate limiting, and fraud prevention (hashed and anonymized where possible)</li>
            <li><strong>Cookies:</strong> Session cookies for authentication and preferences</li>
          </ul>

          <h3>2.3 Third-Party Data</h3>
          <p>If you sign in using Google OAuth, we receive your basic profile information (email, name) from Google. We do not access your Google contacts, files, or other data.</p>

          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Process subscriptions and payments</li>
            <li>Send transactional emails (account confirmations, password resets, subscription updates)</li>
            <li>Send marketing communications (if you opt in to our newsletter)</li>
            <li>Respond to your inquiries and support requests</li>
            <li>Enforce our Terms & Conditions and prevent fraud</li>
            <li>Analyze usage patterns to improve user experience</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>4. Information Sharing</h2>
          <p>We do not sell your personal information. We may share your information with:</p>
          <ul>
            <li><strong>Payment processors:</strong> Stripe and PayPal for processing payments</li>
            <li><strong>Authentication providers:</strong> Google (if using OAuth sign-in)</li>
            <li><strong>Service providers:</strong> Supabase (database/auth), Vercel (hosting)</li>
            <li><strong>Legal authorities:</strong> When required by law or to protect our rights</li>
          </ul>
          <p>All third-party providers are bound by their own privacy policies and data protection agreements.</p>

          <h2>5. Data Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your data, including:</p>
          <ul>
            <li>HTTPS encryption for all data transmission</li>
            <li>Secure password hashing</li>
            <li>Rate limiting to prevent abuse</li>
            <li>Regular security audits and updates</li>
            <li>Access controls limiting employee access to personal data</li>
          </ul>
          <div className={styles.infoBox}>
            <p>
              While we strive to protect your information, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
            </p>
          </div>

          <h2>6. Data Retention</h2>
          <p>We retain your personal data for as long as:</p>
          <ul>
            <li>Your account remains active</li>
            <li>Necessary to provide you services</li>
            <li>Required by law or for legitimate business purposes</li>
          </ul>
          <p>
            When you delete your account, we will delete or anonymize your personal data within 30 days, except where retention is required by law.
          </p>

          <h2>7. Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
            <li><strong>Erasure:</strong> Request deletion of your data (&quot;right to be forgotten&quot;)</li>
            <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
            <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            <li><strong>Withdraw consent:</strong> Where processing is based on consent</li>
          </ul>
          <p>
            To exercise these rights, contact us at <a href="mailto:knighty@knightybuilds.com">knighty@knightybuilds.com</a> or use the account settings page to manage your preferences and request account deletion.
          </p>

          <h2>8. Cookies</h2>
          <p>We use cookies to:</p>
          <ul>
            <li>Maintain your logged-in session</li>
            <li>Remember your preferences</li>
            <li>Understand how you use our Service</li>
          </ul>
          <p>
            You can control cookies through your browser settings. Disabling cookies may affect functionality, particularly authentication.
          </p>

          <h2>9. Children&apos;s Privacy</h2>
          <p>
            Our Service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.
          </p>

          <h2>10. International Data Transfers</h2>
          <p>
            Your data may be processed in countries other than your own. We ensure appropriate safeguards are in place when transferring data internationally.
          </p>

          <h2>11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy periodically. Changes will be posted on this page with an updated revision date. Significant changes will be communicated via email or prominent notice on the Service.
          </p>

          <h2>12. Contact Us</h2>
          <p>If you have questions about this Privacy Policy or our data practices, contact us:</p>
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
