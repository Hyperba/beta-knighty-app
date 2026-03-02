'use client'

import { useState, useEffect } from 'react'
import { Download, Trash2, Search, RefreshCw, Mail, Users, Bell, Newspaper } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { TIER_COLORS, TIER_LABELS } from '@/lib/types/product'
import styles from './page.module.css'

interface Subscriber {
  id: string
  email: string
  created_at: string
}

interface UserPref {
  id: string
  handle: string
  display_name: string
  avatar_url: string | null
  tier: string
  email: string
  email_notifications: boolean
  newsletter_opt_in: boolean
  created_at: string
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export default function AdminNewsletterPage() {
  const [activeTab, setActiveTab] = useState<'subscribers' | 'preferences'>('subscribers')
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [exporting, setExporting] = useState(false)

  // User preferences state
  const [userPrefs, setUserPrefs] = useState<UserPref[]>([])
  const [prefsLoading, setPrefsLoading] = useState(false)
  const [prefsSearch, setPrefsSearch] = useState('')
  const [prefsPage, setPrefsPage] = useState(1)
  const [prefsTotal, setPrefsTotal] = useState(0)
  const [prefsTotalPages, setPrefsTotalPages] = useState(1)

  const fetchSubscribers = async () => {
    setLoading(true)
    const supabase = getSupabaseBrowserClient()

    try {
      const { data } = await supabase.rpc('admin_list_newsletter_subscribers', {
        p_search: search || null,
        p_page: page,
        p_per_page: 50
      })

      if (data?.status === 'success') {
        setSubscribers(data.subscribers || [])
        setTotal(data.total || 0)
        setTotalPages(data.total_pages || 1)
      }
    } catch (err) {
      console.error('Failed to fetch subscribers:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserPrefs = async () => {
    setPrefsLoading(true)
    const supabase = getSupabaseBrowserClient()

    try {
      const { data } = await supabase.rpc('admin_get_user_newsletter_preferences', {
        p_search: prefsSearch || '',
        p_page: prefsPage,
        p_per_page: 50
      })

      if (data?.status === 'success') {
        setUserPrefs(data.users || [])
        setPrefsTotal(data.total || 0)
        setPrefsTotalPages(data.total_pages || 1)
      }
    } catch (err) {
      console.error('Failed to fetch user preferences:', err)
    } finally {
      setPrefsLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscribers()
  }, [search, page])

  useEffect(() => {
    if (activeTab === 'preferences') {
      fetchUserPrefs()
    }
  }, [activeTab, prefsSearch, prefsPage])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchSubscribers()
  }

  const removeSubscriber = async (id: string) => {
    if (!confirm('Are you sure you want to remove this subscriber?')) return

    const supabase = getSupabaseBrowserClient()
    await supabase.rpc('admin_remove_subscriber', { p_id: id })
    setSubscribers(prev => prev.filter(s => s.id !== id))
    setTotal(prev => prev - 1)
  }

  const exportToCSV = async () => {
    setExporting(true)
    const supabase = getSupabaseBrowserClient()

    try {
      const { data, error } = await supabase.rpc('admin_export_newsletter_emails')

      if (error) throw error

      if (data?.status === 'success') {
        const emails = Array.isArray(data.emails) ? data.emails : []

        if (emails.length === 0) {
          alert('No subscribers to export')
          return
        }

        const csvContent = [
          'Email,Subscribed At',
          ...emails.map((e: { email: string; subscribed_at: string }) => 
            `"${(e.email || '').replace(/"/g, '""')}","${e.subscribed_at ? new Date(e.subscribed_at).toISOString() : ''}"`
          )
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } else {
        throw new Error(data?.message || 'Export failed')
      }
    } catch (err: any) {
      console.error('Failed to export:', err)
      alert(err.message || 'Failed to export subscribers')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Newsletter &amp; Preferences</h1>
          <p className={styles.subtitle}>
            {activeTab === 'subscribers'
              ? `${total.toLocaleString()} newsletter subscribers`
              : `${prefsTotal.toLocaleString()} registered users`}
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.refreshBtn} onClick={activeTab === 'subscribers' ? fetchSubscribers : fetchUserPrefs} disabled={loading || prefsLoading}>
            <RefreshCw size={16} className={(loading || prefsLoading) ? styles.spinning : ''} />
          </button>
          {activeTab === 'subscribers' && (
            <button className={styles.exportBtn} onClick={exportToCSV} disabled={exporting}>
              <Download size={16} />
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
          )}
        </div>
      </header>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'subscribers' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('subscribers')}
        >
          <Newspaper size={14} />
          Subscribers
          <span className={styles.tabBadge}>{total}</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'preferences' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          <Users size={14} />
          User Preferences
          <span className={styles.tabBadge}>{prefsTotal}</span>
        </button>
      </div>

      {activeTab === 'subscribers' && (
        <>
          <form className={styles.searchForm} onSubmit={handleSearch}>
            <div className={styles.searchInput}>
              <Search size={16} />
              <input
                type="text"
                placeholder="Search by email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </form>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Subscribed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className={styles.loading}>Loading...</td>
                  </tr>
                ) : subscribers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className={styles.empty}>No subscribers found</td>
                  </tr>
                ) : (
                  subscribers.map((subscriber) => (
                    <tr key={subscriber.id}>
                      <td>
                        <div className={styles.emailCell}>
                          <Mail size={14} />
                          <a href={`mailto:${subscriber.email}`}>{subscriber.email}</a>
                        </div>
                      </td>
                      <td className={styles.dateCell}>{formatDate(subscriber.created_at)}</td>
                      <td>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => removeSubscriber(subscriber.id)}
                          title="Remove subscriber"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
              <span>Page {page} of {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          )}
        </>
      )}

      {activeTab === 'preferences' && (
        <>
          <form className={styles.searchForm} onSubmit={(e) => { e.preventDefault(); setPrefsPage(1); fetchUserPrefs() }}>
            <div className={styles.searchInput}>
              <Search size={16} />
              <input
                type="text"
                placeholder="Search by name, handle, or email..."
                value={prefsSearch}
                onChange={(e) => setPrefsSearch(e.target.value)}
              />
            </div>
          </form>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Tier</th>
                  <th>Newsletter</th>
                  <th>Email Notifs</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {prefsLoading ? (
                  <tr>
                    <td colSpan={6} className={styles.loading}>Loading...</td>
                  </tr>
                ) : userPrefs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.empty}>No users found</td>
                  </tr>
                ) : (
                  userPrefs.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className={styles.userCell}>
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt="" className={styles.userCellAvatar} />
                          ) : (
                            <div className={styles.userCellAvatarPlaceholder} />
                          )}
                          <div className={styles.userCellInfo}>
                            <span className={styles.userCellName}>{u.display_name || u.handle}</span>
                            <span className={styles.userCellHandle}>@{u.handle}</span>
                          </div>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span style={{ color: TIER_COLORS[u.tier as keyof typeof TIER_COLORS] || '#8b5cf6', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                          {TIER_LABELS[u.tier as keyof typeof TIER_LABELS] || u.tier}
                        </span>
                      </td>
                      <td>
                        <span className={u.newsletter_opt_in ? styles.prefStatusOn : styles.prefStatusOff}>
                          {u.newsletter_opt_in ? 'Opted In' : 'Opted Out'}
                        </span>
                      </td>
                      <td>
                        <span className={u.email_notifications ? styles.prefStatusOn : styles.prefStatusOff}>
                          {u.email_notifications ? 'Enabled' : 'Disabled'}
                        </span>
                      </td>
                      <td className={styles.dateCell}>{formatDate(u.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {prefsTotalPages > 1 && (
            <div className={styles.pagination}>
              <button disabled={prefsPage === 1} onClick={() => setPrefsPage(p => p - 1)}>Previous</button>
              <span>Page {prefsPage} of {prefsTotalPages}</span>
              <button disabled={prefsPage === prefsTotalPages} onClick={() => setPrefsPage(p => p + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
