'use client'

import Link from 'next/link'
import { FileText, Shield, CreditCard, Scale, ArrowRight } from 'lucide-react'
import styles from './page.module.css'

const legalPages = [
  {
    title: 'Terms & Conditions',
    description: 'Rules and guidelines for using KnightyBuilds, including account terms, content usage, and user responsibilities.',
    href: '/legals/terms-and-conditions',
    icon: <FileText size={24} />,
  },
  {
    title: 'Privacy Policy',
    description: 'How we collect, use, and protect your personal information when you use our services.',
    href: '/legals/privacy-policy',
    icon: <Shield size={24} />,
  },
  {
    title: 'Refund Policy',
    description: 'Our policy on purchases, subscriptions, and refund eligibility for digital content.',
    href: '/legals/refund-policy',
    icon: <CreditCard size={24} />,
  },
  {
    title: 'License Agreement',
    description: 'Terms governing how you may use, modify, and distribute builds and assets from KnightyBuilds.',
    href: '/legals/license',
    icon: <Scale size={24} />,
  },
]

export default function LegalsPage() {
  return (
    <main className={styles.legalsHub}>
      <div className={styles.legalsHubInner}>
        <header className={styles.legalsHubHeader}>
          <h1 className={styles.legalsHubTitle}>Legal Information</h1>
          <p className={styles.legalsHubSubtitle}>
            Review our policies and terms that govern your use of KnightyBuilds and our digital content.
          </p>
        </header>

        <div className={styles.legalsGrid}>
          {legalPages.map((page) => (
            <Link key={page.href} href={page.href} className={styles.legalCard}>
              <div className={styles.legalCardIcon}>{page.icon}</div>
              <h2 className={styles.legalCardTitle}>{page.title}</h2>
              <p className={styles.legalCardDesc}>{page.description}</p>
              <span className={styles.legalCardArrow}>
                Read More <ArrowRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
