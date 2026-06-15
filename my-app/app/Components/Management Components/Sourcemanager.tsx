'use client';

import { useState } from 'react';
import styles from './styles/Sourcemanager.module.css';

interface Source {
  id: string;
  name: string;
  type: 'rss' | 'api';
  url: string;
  enabled: boolean;
  articleCount: number;
  icon: string;
  color: string;
}

const INITIAL_SOURCES: Source[] = [
  { id: '1', name: 'NewsAPI',    type: 'api', url: 'newsapi.org',    enabled: true,  articleCount: 142, icon: 'N', color: '#22d3ee' },
  { id: '2', name: 'Dev.to',     type: 'api', url: 'dev.to',         enabled: true,  articleCount: 89,  icon: 'D', color: '#a78bfa' },
  { id: '3', name: 'Medium',     type: 'api', url: 'medium.com',     enabled: false, articleCount: 204, icon: 'M', color: '#f97316' },
  { id: '4', name: 'Hacker News',type: 'rss', url: 'news.ycombinator.com', enabled: true, articleCount: 60, icon: 'Y', color: '#fbbf24' },
  { id: '5', name: 'Aeon',       type: 'rss', url: 'aeon.co/feed',   enabled: true,  articleCount: 38,  icon: 'A', color: '#34d399' },
];

export default function SourceManager() {
  const [sources, setSources] = useState<Source[]>(INITIAL_SOURCES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'rss' | 'api'>('rss');
  const [adding, setAdding] = useState(false);

  function toggleSource(id: string) {
    setSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  }

  function removeSource(id: string) {
    setSources((prev) => prev.filter((s) => s.id !== id));
  }

  function handleAdd() {
    if (!newUrl.trim() || !newName.trim()) return;
    setAdding(true);
    setTimeout(() => {
      const colors = ['#22d3ee', '#a78bfa', '#f97316', '#34d399', '#fb7185', '#fbbf24'];
      setSources((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          name: newName.trim(),
          type: newType,
          url: newUrl.trim(),
          enabled: true,
          articleCount: 0,
          icon: newName.trim()[0].toUpperCase(),
          color: colors[prev.length % colors.length],
        },
      ]);
      setNewUrl('');
      setNewName('');
      setAdding(false);
      setShowAddModal(false);
    }, 800);
  }

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
          <span className={styles.statValue}>{sources.length}</span>
          <span className={styles.statLabel}>Sources</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statValue}>{sources.filter((s) => s.enabled).length}</span>
          <span className={styles.statLabel}>Active</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statValue}>{sources.reduce((a, s) => a + s.articleCount, 0)}</span>
          <span className={styles.statLabel}>Articles</span>
        </div>
      </div>

      {/* Source cards */}
      <div className={styles.sourceList}>
        {sources.map((source) => (
          <div key={source.id} className={`${styles.sourceCard} ${!source.enabled ? styles.sourceCardDisabled : ''}`}>
            {/* Icon */}
            <div className={styles.sourceIcon} style={{ background: source.color + '18', borderColor: source.color + '30', color: source.color }}>
              {source.icon}
            </div>

            {/* Info */}
            <div className={styles.sourceInfo}>
              <div className={styles.sourceNameRow}>
                <span className={styles.sourceName}>{source.name}</span>
                <span className={styles.sourceTypeBadge}>{source.type.toUpperCase()}</span>
              </div>
              <span className={styles.sourceUrl}>{source.url}</span>
              <span className={styles.sourceCount}>{source.articleCount} articles indexed</span>
            </div>

            {/* Actions */}
            <div className={styles.sourceActions}>
              {/* Toggle */}
              <button
                className={`${styles.switch} ${source.enabled ? styles.switchOn : styles.switchOff}`}
                onClick={() => toggleSource(source.id)}
                role="switch"
                aria-checked={source.enabled}
                aria-label={`Toggle ${source.name}`}
              >
                <span className={`${styles.thumb} ${source.enabled ? styles.thumbOn : styles.thumbOff}`} />
              </button>

              {/* Remove */}
              <button
                className={styles.removeBtn}
                onClick={() => removeSource(source.id)}
                aria-label={`Remove ${source.name}`}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Source Modal */}
      {showAddModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowAddModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h4 className={styles.modalTitle}>Add New Source</h4>
              <button className={styles.modalClose} onClick={() => setShowAddModal(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Type selector */}
            <div className={styles.typeSelector}>
              {(['rss', 'api'] as const).map((t) => (
                <button
                  key={t}
                  className={`${styles.typeBtn} ${newType === t ? styles.typeBtnActive : ''}`}
                  onClick={() => setNewType(t)}
                >
                  {t === 'rss' ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/>
                    </svg>
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                    </svg>
                  )}
                  {t.toUpperCase()} Feed
                </button>
              ))}
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
                <label className={styles.fieldLabel}>{newType === 'rss' ? 'Feed URL' : 'API Endpoint / Domain'}</label>
                <input
                  className={styles.fieldInput}
                  type="text"
                  placeholder={newType === 'rss' ? 'https://wired.com/feed/rss' : 'newsapi.org'}
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                />
              </div>
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