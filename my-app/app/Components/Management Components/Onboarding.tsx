'use client';

import { useState } from 'react';
import styles from './styles/Onboarding.module.css';

const TOPICS = [
  'Artificial Intelligence', 'Design', 'Science', 'Philosophy',
  'Architecture', 'Psychology', 'Climate', 'Space', 'Culture', 'Technology',
  'Neuroscience', 'Business', 'Urbanism', 'Quantum Physics', 'Future',
];

interface OnboardingProps {
  onComplete?: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [theme, setTheme] = useState<'crystal' | 'obsidian'>('obsidian');
  const [exiting, setExiting] = useState(false);

  const TOTAL_STEPS = 3;

  function next() {
    if (step < TOTAL_STEPS) {
      setExiting(true);
      setTimeout(() => { setStep((s) => s + 1); setExiting(false); }, 260);
    } else {
      onComplete?.();
    }
  }

  function back() {
    if (step > 1) {
      setExiting(true);
      setTimeout(() => { setStep((s) => s - 1); setExiting(false); }, 260);
    }
  }

  function toggleTopic(topic: string) {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  }

  const canProceed =
    (step === 1 && name.trim().length >= 2) ||
    (step === 2 && selectedTopics.length >= 3) ||
    step === 3;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Progress bar */}
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        {/* Step indicator */}
        <div className={styles.stepIndicator}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className={styles.stepDotWrapper}>
              <div className={`${styles.stepDot} ${i + 1 <= step ? styles.stepDotActive : ''} ${i + 1 === step ? styles.stepDotCurrent : ''}`}>
                {i + 1 < step ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              {i < TOTAL_STEPS - 1 && (
                <div className={`${styles.stepLine} ${i + 1 < step ? styles.stepLineActive : ''}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step label */}
        <span className={styles.stepLabel}>STEP {step} OF {TOTAL_STEPS}</span>

        {/* Content */}
        <div className={`${styles.content} ${exiting ? styles.contentExit : styles.contentEnter}`}>

          {/* Step 1: Welcome + Name */}
          {step === 1 && (
            <div className={styles.stepContent}>
              <div className={styles.stepIcon}>👋</div>
              <h2 className={styles.stepTitle}>Welcome to ReadLite</h2>
              <p className={styles.stepDesc}>
                A precision reading environment built around your curiosity. Let's set things up.
              </p>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>What should we call you?</label>
                <input
                  className={styles.fieldInput}
                  type="text"
                  placeholder="Your name…"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Step 2: Topics */}
          {step === 2 && (
            <div className={styles.stepContent}>
              <div className={styles.stepIcon}>✦</div>
              <h2 className={styles.stepTitle}>What interests you?</h2>
              <p className={styles.stepDesc}>
                Pick at least 3 topics. We'll curate your feed around them.
              </p>
              <div className={styles.topicGrid}>
                {TOPICS.map((topic) => (
                  <button
                    key={topic}
                    className={`${styles.topicChip} ${selectedTopics.includes(topic) ? styles.topicChipActive : ''}`}
                    onClick={() => toggleTopic(topic)}
                  >
                    {selectedTopics.includes(topic) && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                    {topic}
                  </button>
                ))}
              </div>
              <span className={styles.topicCount}>
                {selectedTopics.length} selected{selectedTopics.length < 3 ? ` (${3 - selectedTopics.length} more to go)` : ' ✓'}
              </span>
            </div>
          )}

          {/* Step 3: Theme */}
          {step === 3 && (
            <div className={styles.stepContent}>
              <div className={styles.stepIcon}>◐</div>
              <h2 className={styles.stepTitle}>Choose your aesthetic</h2>
              <p className={styles.stepDesc}>
                Crystal Light for airy clarity. Deep Obsidian for immersive contrast. You can change this any time.
              </p>
              <div className={styles.themeOptions}>
                <button
                  className={`${styles.themeOption} ${styles.themeLight} ${theme === 'crystal' ? styles.themeOptionActive : ''}`}
                  onClick={() => setTheme('crystal')}
                >
                  <div className={styles.themePreview} style={{ background: '#f0f4f8' }}>
                    <div className={styles.themePreviewBar} style={{ background: '#1e293b' }} />
                    <div className={styles.themePreviewLine} style={{ background: '#94a3b8' }} />
                    <div className={styles.themePreviewLine} style={{ background: '#cbd5e1', width: '70%' }} />
                  </div>
                  <span className={styles.themeLabel}>Crystal Light</span>
                  {theme === 'crystal' && <div className={styles.themeCheck}>✓</div>}
                </button>

                <button
                  className={`${styles.themeOption} ${styles.themeDark} ${theme === 'obsidian' ? styles.themeOptionActive : ''}`}
                  onClick={() => setTheme('obsidian')}
                >
                  <div className={styles.themePreview} style={{ background: '#080d18' }}>
                    <div className={styles.themePreviewBar} style={{ background: '#111827' }} />
                    <div className={styles.themePreviewLine} style={{ background: '#f8fafc' }} />
                    <div className={styles.themePreviewLine} style={{ background: '#64748b', width: '70%' }} />
                  </div>
                  <span className={styles.themeLabel}>Deep Obsidian</span>
                  {theme === 'obsidian' && <div className={styles.themeCheck}>✓</div>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className={styles.nav}>
          {step > 1 ? (
            <button className={styles.backBtn} onClick={back}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            className={`${styles.nextBtn} ${!canProceed ? styles.nextBtnDisabled : ''}`}
            onClick={next}
            disabled={!canProceed}
          >
            {step === TOTAL_STEPS ? 'Start Reading' : 'Continue'}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}