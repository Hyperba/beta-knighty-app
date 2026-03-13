'use client'

import { useState, useEffect } from 'react'
import { UserX, AlertCircle } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { TIER_COLORS, TIER_LABELS } from '@/lib/types/product'
import styles from './page.module.css'

interface DeletionRequest {
  id: string
  handle: string
  display_name: string
  avatar_url: string | null
  tier: string
  email: string
  deletion_requested_at: string
  created_at: string
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(dateString)
}

export default function DeletionRequestsPage() {
  const [requests, setRequests] = useState<DeletionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const fetchRequests = async () => {
      const supabase = getSupabaseBrowserClient()
      try {
        const { data } = await supabase.rpc('admin_get_deletion_requests')
        if (data?.status === 'success') {
          setRequests(data.requests || [])
          setTotal(data.total || 0)
        }
      } catch (err) {
        console.error('Failed to fetch deletion requests:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Deletion Requests</h1>
          <p className={styles.subtitle}>Users who have requested account deletion</p>
        </div>
        {total > 0 && (
          <span className={styles.badge}>
            <AlertCircle size={14} />
            {total} pending
          </span>
        )}
      </header>

      <div className={styles.section}>
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : requests.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <UserX size={40} />
            </div>
            <h3 className={styles.emptyTitle}>No deletion requests</h3>
            <p className={styles.emptyText}>No users have requested account deletion</p>
          </div>
        ) : (
          <div className={styles.requestsList}>
            {requests.map((req) => (
              <div key={req.id} className={styles.requestItem}>
                {req.avatar_url ? (
                  <img src={req.avatar_url} alt="" className={styles.requestAvatar} />
                ) : (
                  <div className={styles.requestAvatarPlaceholder}>
                    <UserX size={16} />
                  </div>
                )}
                <div className={styles.requestInfo}>
                  <div className={styles.requestName}>{req.display_name || req.handle}</div>
                  <div className={styles.requestHandle}>@{req.handle}</div>
                  <div className={styles.requestEmail}>{req.email}</div>
                </div>
                <div className={styles.requestMeta}>
                  <span className={styles.requestDate}>
                    Requested {formatRelativeTime(req.deletion_requested_at)}
                  </span>
                  <span
                    className={styles.requestTier}
                    style={{ color: TIER_COLORS[req.tier as keyof typeof TIER_COLORS] || '#8b5cf6' }}
                  >
                    {TIER_LABELS[req.tier as keyof typeof TIER_LABELS] || req.tier}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
