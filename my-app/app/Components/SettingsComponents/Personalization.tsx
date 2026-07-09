// Components/SettingsComponents/Personalization.tsx
'use client';

import { useEffect, useState } from 'react';
import styles from './styles/Personalization.module.css';
import { TOPICS } from '@/lib/topics';

export default function Personalization() {
  const [activeTopics, setActiveTopics] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/user/preferences')
      .then((res) => (res.ok ? res.json() : null))
      .then((prefs) => {
        if (prefs) setActiveTopics(prefs.preferredTopics);
      });
  }, []);

  async function toggleTopic(id: string) {
    const next = activeTopics.includes(id)
      ? activeTopics.filter((t) => t !== id)
      : [...activeTopics, id];
    setActiveTopics(next);
    await fetch('/api/user/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferredTopics: next }),
    });
  }

  return (
    <div className={styles.personalization}>
      <div className={styles.header}>
        <span className={styles.label}>PERSONALIZATION</span>
        <h3 className={styles.title}>Topic Curation & Feed</h3>
      </div>

      <div className={styles.topicsList}>
        {TOPICS.map((topic) => {
          const active = activeTopics.includes(topic.id);
          return (
            <div key={topic.id} className={styles.topicRow}>
              <span className={styles.topicName}>{topic.label}</span>
              <button
                className={styles.actionBtn}
                onClick={() => toggleTopic(topic.id)}
                aria-label={active ? `Remove ${topic.label}` : `Add ${topic.label}`}
              >
                {active ? '✖' : '+'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
