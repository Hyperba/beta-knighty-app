'use client'

import Link from 'next/link'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import styles from '../page.module.css'

export default function TermsAndConditionsPage() {
  const lastUpdated = 'February 28, 2026'

  return (
    <main className={styles.legalPage}>
      <div className={styles.legalPageInner}>
        <header className={styles.legalPageHeader}>
          <nav className={styles.legalPageBreadcrumb}>
            <Link href="/legals">Legal</Link>
            <ChevronRight size={14} />
            <span>Terms & Conditions</span>
          </nav>
          <h1 className={styles.legalPageTitle}>Terms & Conditions</h1>
          <p className={styles.legalPageMeta}>Last updated: {lastUpdated}</p>
        </header>

        <div className={styles.legalContent}>
          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing or using KnightyBuilds (the &quot;Service&quot;), you agree to be bound by these Terms & Conditions. 
            If you do not agree to these terms, you may not access or use the Service.
          </p>
          <p>
            These terms apply to all visitors, users, and subscribers of KnightyBuilds.
          </p>

          <h2>2. Account Terms</h2>
          <p>
            To access certain features of the Service, you must create an account. When creating an account, you agree to:
          </p>
          <ul>
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Accept responsibility for all activities under your account</li>
            <li>Notify us immediately of any unauthorized access</li>
          </ul>
          <p>
            You must be at least 13 years of age to create an account. If you are under 18, you must have parental or guardian consent.
          </p>

          <h2>3. Subscription Services</h2>
          <p>
            KnightyBuilds offers subscription tiers (Explorer, Access, Builder, Architect) that provide varying levels of access to our digital content.
          </p>
          <ul>
            <li><strong>Billing:</strong> Subscriptions are billed on a recurring basis (monthly or yearly) until cancelled</li>
            <li><strong>Access:</strong> Your tier determines which builds, guides, and assets you can download</li>
            <li><strong>Cancellation:</strong> You may cancel your subscription at any time through your account settings</li>
            <li><strong>Downgrades:</strong> Access to higher-tier content ends when your subscription period expires</li>
          </ul>

          <div className={styles.warningBox}>
            <p>
              <strong>Important:</strong> Sharing your subscription login credentials or account access with others is strictly prohibited and may result in account termination.
            </p>
          </div>

          <h2>4. User Conduct</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Share, distribute, or resell any content from KnightyBuilds</li>
            <li>Claim ownership of any builds, assets, or content created by KnightyBuilds</li>
            <li>Upload our content to other platforms, marketplaces, or file-sharing sites</li>
            <li>Use automated systems to scrape, download, or collect content</li>
            <li>Attempt to circumvent access restrictions or security measures</li>
            <li>Harass, abuse, or harm other users or KnightyBuilds staff</li>
            <li>Use the Service for any illegal purpose</li>
          </ul>

          <h2>5. Content Usage Rights</h2>
          <p>
            All builds, assets, and content available through KnightyBuilds are licensed, not sold. Your usage rights are governed by our <Link href="/legals/license">License Agreement</Link>.
          </p>
          <p>Key points:</p>
          <ul>
            <li>You may use downloaded content for personal Minecraft gameplay</li>
            <li>You may modify builds for your personal use</li>
            <li>You may feature builds in videos and public media (YouTube, TikTok, etc.) with credit to KnightyBuilds</li>
            <li>You may NOT resell, redistribute, or claim ownership of any content</li>
          </ul>

          <h2>6. Intellectual Property</h2>
          <p>
            All content on KnightyBuilds, including but not limited to builds, assets, images, logos, text, and design elements, is the intellectual property of KnightyBuilds and is protected by copyright and other intellectual property laws.
          </p>
          <p>
            The KnightyBuilds name, logo, and branding are trademarks of KnightyBuilds. You may not use these without prior written permission.
          </p>

          <h2>7. Payments and Refunds</h2>
          <p>
            All payments are processed securely through our payment providers (Stripe and/or PayPal). By making a purchase, you agree to our <Link href="/legals/refund-policy">Refund Policy</Link>.
          </p>
          <div className={styles.highlightBox}>
            <p>
              <strong>All purchases and subscriptions are final.</strong> Due to the digital nature of our products, we do not offer refunds. Please review content carefully before purchasing.
            </p>
          </div>

          <h2>8. Account Termination</h2>
          <p>
            We reserve the right to suspend or terminate your account at our discretion if you violate these terms. Grounds for termination include:
          </p>
          <ul>
            <li>Sharing subscription access with others</li>
            <li>Redistributing or reselling our content</li>
            <li>Attempting to circumvent payment or access restrictions</li>
            <li>Abusive behavior toward staff or other users</li>
            <li>Any violation of these Terms & Conditions</li>
          </ul>
          <p>
            Terminated accounts forfeit access to all content and are not eligible for refunds.
          </p>

          <h2>9. Service Modifications</h2>
          <p>
            We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time. This includes:
          </p>
          <ul>
            <li>Adding or removing features</li>
            <li>Changing subscription pricing (existing subscribers will be notified in advance)</li>
            <li>Updating content availability</li>
            <li>Modifying download limits or access restrictions</li>
          </ul>

          <h2>10. Disclaimer of Warranties</h2>
          <p>
            The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied. We do not guarantee that:
          </p>
          <ul>
            <li>The Service will be uninterrupted or error-free</li>
            <li>Content will be compatible with all Minecraft versions</li>
            <li>Downloads will be available indefinitely</li>
          </ul>

          <h2>11. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, KnightyBuilds shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.
          </p>

          <h2>12. Changes to Terms</h2>
          <p>
            We may update these Terms & Conditions at any time. Changes will be posted on this page with an updated revision date. Continued use of the Service after changes constitutes acceptance of the new terms.
          </p>
          <p>
            For significant changes, we will notify users via email or prominent notice on the Service.
          </p>

          <h2>13. Contact Information</h2>
          <p>
            If you have questions about these Terms & Conditions, please contact us:
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
