'use client'

import Link from 'next/link'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import styles from '../page.module.css'

export default function LicenseAgreementPage() {
  const lastUpdated = 'February 28, 2026'

  return (
    <main className={styles.legalPage}>
      <div className={styles.legalPageInner}>
        <header className={styles.legalPageHeader}>
          <nav className={styles.legalPageBreadcrumb}>
            <Link href="/legals">Legal</Link>
            <ChevronRight size={14} />
            <span>License Agreement</span>
          </nav>
          <h1 className={styles.legalPageTitle}>License Agreement</h1>
          <p className={styles.legalPageMeta}>Last updated: {lastUpdated}</p>
        </header>

        <div className={styles.legalContent}>
          <div className={styles.highlightBox}>
            <p>
              All builds, assets, and content on KnightyBuilds are <strong>licensed, not sold</strong>. 
              By downloading or using any content, you agree to the terms of this License Agreement.
            </p>
          </div>

          <h2>1. License Grant</h2>
          <p>
            Subject to your compliance with these terms and your active subscription (where applicable), KnightyBuilds grants you a limited, non-exclusive, non-transferable, revocable license to use the downloaded content.
          </p>

          <h2>2. Permitted Uses</h2>
          <p>You <strong>MAY</strong> use KnightyBuilds content for:</p>
          
          <h3>2.1 Personal Use</h3>
          <ul>
            <li>Use builds in your personal Minecraft worlds (singleplayer or multiplayer servers you play on)</li>
            <li>Modify builds for your personal enjoyment</li>
            <li>Use builds on private servers where you are a member</li>
          </ul>

          <h3>2.2 Content Creation (with Credit)</h3>
          <ul>
            <li>Feature builds in YouTube videos, TikToks, Twitch streams, and other public media</li>
            <li>Include builds in screenshots and social media posts</li>
            <li>Use builds for educational content or tutorials</li>
          </ul>
          <div className={styles.infoBox}>
            <p>
              <strong>Credit Required:</strong> When featuring KnightyBuilds content in public media, you must credit &quot;KnightyBuilds&quot; in your video description, post caption, or on-screen attribution.
            </p>
          </div>

          <h3>2.3 Private Commissions (Limited)</h3>
          <p>
            You MAY use assets and builds in private commission projects (work sold to a specific client or business, not the general public) <strong>ONLY IF</strong> both conditions are met:
          </p>
          <ul>
            <li><strong>Significant modifications</strong> are made to the original asset</li>
            <li>The KnightyBuilds asset is <strong>not the primary focus</strong> of the project</li>
          </ul>
          <p>
            Example: Using a KnightyBuilds statue as a small decorative element in a larger commissioned city build is permitted. Selling a KnightyBuilds statue with minor edits as the main deliverable is NOT permitted.
          </p>

          <h2>3. Prohibited Uses</h2>
          <p>You <strong>MAY NOT</strong>:</p>

          <h3>3.1 Redistribution</h3>
          <ul>
            <li>Share, upload, or distribute builds/assets to any other platform, marketplace, or file-sharing site</li>
            <li>Include builds in asset packs or collections that are distributed to others</li>
            <li>Send build files to other people (even friends)</li>
          </ul>

          <h3>3.2 Resale</h3>
          <ul>
            <li>Sell builds or assets, whether modified or unmodified</li>
            <li>Offer builds as rewards, incentives, or products on Patreon, Ko-fi, or similar platforms</li>
            <li>Include builds in products sold to the general public</li>
          </ul>

          <h3>3.3 Ownership Claims</h3>
          <ul>
            <li>Claim that you created or own any KnightyBuilds content</li>
            <li>Remove or obscure credit or attribution to KnightyBuilds</li>
            <li>Present modified versions as entirely your own original work</li>
          </ul>

          <h3>3.4 Account Sharing</h3>
          <ul>
            <li>Share your account login credentials with others</li>
            <li>Allow others to access your account to download content</li>
            <li>Download content on behalf of others who don&apos;t have a subscription</li>
          </ul>

          <div className={styles.warningBox}>
            <p>
              <strong>Violation of these terms may result in immediate account termination without refund.</strong>
            </p>
          </div>

          <h2>4. Modifications</h2>
          <p>
            You may modify downloaded builds for your personal use. However:
          </p>
          <ul>
            <li>Modified versions remain subject to this License Agreement</li>
            <li>Modified versions cannot be redistributed or sold</li>
            <li>You may not claim modified versions as entirely your own original work</li>
            <li>The underlying intellectual property remains owned by KnightyBuilds</li>
          </ul>

          <h2>5. Intellectual Property</h2>
          <p>
            All content on KnightyBuilds — including builds, assets, images, designs, guides, and documentation — is the intellectual property of KnightyBuilds and is protected by copyright.
          </p>
          <p>
            This license does not transfer any ownership rights. KnightyBuilds retains all rights not expressly granted in this Agreement.
          </p>

          <h2>6. License Termination</h2>
          <p>Your license to use KnightyBuilds content terminates if:</p>
          <ul>
            <li>You violate any terms of this Agreement</li>
            <li>Your subscription expires or is cancelled (for subscription-gated content)</li>
            <li>Your account is terminated for any reason</li>
          </ul>
          <p>
            Upon termination, you must cease all use of the content and delete any downloaded files.
          </p>

          <h2>7. Enforcement</h2>
          <p>
            We actively monitor for license violations. If we discover unauthorized redistribution, resale, or other violations, we may:
          </p>
          <ul>
            <li>Issue takedown requests (DMCA or equivalent)</li>
            <li>Terminate your account without refund</li>
            <li>Pursue legal action for damages</li>
          </ul>

          <h2>8. Questions</h2>
          <p>
            If you&apos;re unsure whether a specific use is permitted, please contact us <strong>before</strong> using the content:
          </p>
          <ul>
            <li>Email: <a href="mailto:knighty@knightybuilds.com">knighty@knightybuilds.com</a></li>
            <li>Contact Page: <Link href="/contact">/contact</Link></li>
          </ul>
          <p>
            We&apos;re happy to clarify and may grant additional permissions on a case-by-case basis.
          </p>
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
