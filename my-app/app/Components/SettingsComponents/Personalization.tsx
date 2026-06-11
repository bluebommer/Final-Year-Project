// Components/SettingsComponents/Personalization.tsx
'use client';

import { useState } from 'react';
import styles from './styles/Personalization.module.css';

interface Topic {
  id: string;
  name: string;
  active: boolean;
}

const INITIAL_TOPICS: Topic[] = [
  { id: 'quantum', name: 'Quantum Physics', active: true },
  { id: 'minimalist', name: 'Minimalist Design', active: true },
  { id: 'architecture', name: 'Architectural Theory', active: false },
  { id: 'neuroscience', name: 'Neuroscience', active: false },
  { id: 'urbanism', name: 'Urbanism', active: false },
];

export default function Personalization() {
  const [topics, setTopics] = useState<Topic[]>(INITIAL_TOPICS);

  const toggleTopic = (id: string) => {
    setTopics(prev =>
      prev.map(topic =>
        topic.id === id ? { ...topic, active: !topic.active } : topic
      )
    );
  };

  return (
    <div className={styles.personalization}>
      <div className={styles.header}>
        <span className={styles.label}>PERSONALIZATION</span>
        <h3 className={styles.title}>Topic Curation & Feed</h3>
      </div>

      <div className={styles.topicsList}>
        {topics.map(topic => (
          <div key={topic.id} className={styles.topicRow}>
            <span className={styles.topicName}>{topic.name}</span>
            <button
              className={styles.actionBtn}
              onClick={() => toggleTopic(topic.id)}
              aria-label={topic.active ? 'Remove' : 'Add'}
            >
              {topic.active ? '✖' : '+'}
            </button>
          </div>
        ))}
      </div>

      <button className={styles.advancedBtn}>
        Advanced Algorithm Adjustments
      </button>
    </div>
  );
}