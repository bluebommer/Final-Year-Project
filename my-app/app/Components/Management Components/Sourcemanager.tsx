'use client';

import { useEffect, useState, useCallback } from 'react';
import styles from './styles/Sourcemanager.module.css';
import { BUILTIN_SOURCES, type SourceId } from '@/lib/sources';

interface CustomFeed {
  id: string;
  name: string;
  url: string;
}

interface Preferences {
  preferredTopics: string[];
  enabledSources: string[];
  customFeeds: CustomFeed[];
}

async function fetchPrefs(): Promise<Preferences | null> {
  const res = await fetch('/api/user/preferences');
  if (!res.ok) return null;
  return res.json();
}

export default function SourceManager() {
  const [enabledSources, setEnabledSources] = useState<string[]>(BUILTIN_SOURCES.map((s) => s.id));
  const [customFeeds, setCustomFeeds] = useState<CustomFeed[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  const reload = useCallback(() => {
    fetchPrefs().then((prefs) => {
      if (!prefs) return;
      setEnabledSources(prefs.enabledSources);
      setCustomFeeds(prefs.customFeeds);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  async function toggleSource(id: SourceId) {
    const next = enabledSources.includes(id)
      ? enabledSources.filter((s) => s !== id)
      : [...enabledSources, id];
    setEnabledSources(next);
    await fetch('/api/user/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabledSources: next }),
    });
  }

  async function removeCustomFeed(id: string) {
    setCustomFeeds((prev) => prev.filter((f) => f.id !== id));
    await fetch('/api/user/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ removeCustomFeedId: id }),
    });
  }

  async function handleAdd() {
    if (!newUrl.trim() || !newName.trim()) return;
    setAdding(true);
    setAddError('');
    try {
      const res = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addCustomFeed: { name: newName.trim(), url: newUrl.trim() } }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error ?? 'Could not add that feed.');
        return;
      }
      setCustomFeeds(data.customFeeds);
      setNewUrl('');
      setNewName('');
      setShowAddModal(false);
    } catch {
      setAddError('Network error. Please try again.');
    } finally {
      setAdding(false);
    }
  }

  const activeCount = enabledSources.length;

  return (
    <div className={styles.wrapper}>
      {/* Section header */}
      <div className={styles.sectionHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.iconWrap}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 11a9 9 0 0 1 9 9"/>
              <path d="M4 4a16 16 0 0 1 16 16"/>
              <circle cx="5" cy="19" r="1"/>
            </svg>
          </div>
          <div>
            <h3 className={styles.sectionTitle}>Source Management</h3>
            <span className={styles.sectionSub}>RSS FEEDS & API CONNECTIONS</span>
          </div>
        </div>
        <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Source
        </button>
      </div>

      {/* Stats bar */}
      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{BUILTIN_SOURCES.length}</span>
          <span className={styles.statLabel}>Sources</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statValue}>{activeCount}</span>
          <span className={styles.statLabel}>Active</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statValue}>{customFeeds.length}</span>
          <span className={styles.statLabel}>Custom Feeds</span>
        </div>
      </div>

      {/* Built-in sources */}
      <span className={styles.groupLabel}>BUILT-IN SOURCES</span>
      <div className={styles.sourceList}>
        {BUILTIN_SOURCES.map((source) => {
          const enabled = enabledSources.includes(source.id);
          return (
            <div key={source.id} className={`${styles.sourceCard} ${!enabled ? styles.sourceCardDisabled : ''}`}>
              <div className={styles.sourceIcon} style={{ background: source.color + '18', borderColor: source.color + '30', color: source.color }}>
                {source.icon}
              </div>
              <div className={styles.sourceInfo}>
                <div className={styles.sourceNameRow}>
                  <span className={styles.sourceName}>{source.name}</span>
                  <span className={styles.sourceTypeBadge}>{source.type.toUpperCase()}</span>
                </div>
              </div>
              <div className={styles.sourceActions}>
                <button
                  className={`${styles.switch} ${enabled ? styles.switchOn : styles.switchOff}`}
                  onClick={() => toggleSource(source.id)}
                  role="switch"
                  aria-checked={enabled}
                  aria-label={`Toggle ${source.name}`}
                  disabled={!loaded}
                >
                  <span className={`${styles.thumb} ${enabled ? styles.thumbOn : styles.thumbOff}`} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom RSS feeds */}
      <span className={styles.groupLabel}>YOUR RSS FEEDS</span>
      {customFeeds.length === 0 ? (
        <div className={styles.emptyFeeds}>No custom feeds added yet.</div>
      ) : (
        <div className={styles.sourceList}>
          {customFeeds.map((feed) => (
            <div key={feed.id} className={styles.sourceCard}>
              <div className={styles.sourceIcon} style={{ background: '#a78bfa18', borderColor: '#a78bfa30', color: '#a78bfa' }}>
                {feed.name[0]?.toUpperCase() || 'F'}
              </div>
              <div className={styles.sourceInfo}>
                <div className={styles.sourceNameRow}>
                  <span className={styles.sourceName}>{feed.name}</span>
                  <span className={styles.sourceTypeBadge}>RSS</span>
                </div>
                <span className={styles.sourceUrl}>{feed.url}</span>
              </div>
              <div className={styles.sourceActions}>
                <button
                  className={styles.removeBtn}
                  onClick={() => removeCustomFeed(feed.id)}
                  aria-label={`Remove ${feed.name}`}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Source Modal */}
      {showAddModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowAddModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h4 className={styles.modalTitle}>Add RSS Feed</h4>
              <button className={styles.modalClose} onClick={() => setShowAddModal(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Type selector — API sources aren't generically supportable (unknown response shape) */}
            <div className={styles.typeSelector}>
              <button className={`${styles.typeBtn} ${styles.typeBtnActive}`} disabled>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/>
                </svg>
                RSS Feed
              </button>
              <button className={`${styles.typeBtn} ${styles.typeBtnDisabled}`} disabled title="Coming soon">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                </svg>
                API (coming soon)
              </button>
            </div>

            <div className={styles.modalFields}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Source Name</label>
                <input
                  className={styles.fieldInput}
                  type="text"
                  placeholder="e.g. Wired, The Verge…"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Feed URL</label>
                <input
                  className={styles.fieldInput}
                  type="text"
                  placeholder="https://wired.com/feed/rss"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                />
              </div>
              {addError && <span className={styles.formError}>{addError}</span>}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowAddModal(false)}>Cancel</button>
              <button
                className={styles.confirmBtn}
                onClick={handleAdd}
                disabled={!newUrl.trim() || !newName.trim() || adding}
              >
                {adding ? (
                  <><span className={styles.spinner} />Connecting…</>
                ) : (
                  'Add Source'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
