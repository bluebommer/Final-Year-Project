
"use client"
import { Topic } from '@/app';
import dynamic from 'next/dynamic';
import React, { useState } from "react";
const TopicCard = dynamic(() => import('./TopicCard'));


const MIN_TOPICS = 5;

const TOPICS: Topic[] = [
  { id: "quantum-tech", label: "Quantum Tech", icon: "⚛", category: "Primary Domain", size: "large" },
  { id: "space", label: "Space", icon: "🚀", size: "medium" },
  { id: "acoustics", label: "Acoustics", icon: "🎚", size: "medium" },
  { id: "architecture", label: "Architecture", icon: "🏛", category: "Design", size: "wide" },
  { id: "genetics", label: "Genetics", icon: "🧬", size: "medium" },
  { id: "ai-ethics", label: "A.I. Ethics", icon: "🤖", size: "medium" },
  { id: "global-markets", label: "Global Markets", sublabel: "Economics & Future Trends", icon: "🏦", size: "wide" },
  { id: "philosophy", label: "Philosophy", icon: "📖", size: "medium" },
  { id: "medicine", label: "Medicine", icon: "🩺", size: "medium" },
  { id: "climate", label: "Climate", icon: "🌍", size: "medium" },
  { id: "cybersecurity", label: "Cybersecurity", icon: "🔐", size: "medium" },
  { id: "neuroscience", label: "Neuroscience", icon: "🧠", size: "medium" },
  { id: "geopolitics", label: "Geopolitics", icon: "🗺", size: "medium" },
  { id: "deep-tech", label: "Deep Tech", sublabel: "Frontier Research", icon: "💡", size: "wide" },
];

interface PreferencesPageProps {
  onContinue: (selected: string[]) => void;
}

export default function PreferencesPage({ onContinue }: PreferencesPageProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const count = selected.size;
  const canContinue = count >= MIN_TOPICS;

  return (
    <main className="prefs">
      <header className="prefs__header">
        <h1 className="prefs__title">
          What fuels your <span className="prefs__title-accent">curiosity?</span>
        </h1>
        <p className="prefs__subtitle">
          Select your interests to curate a high-precision reading experience
          tailored to your unique technical and creative appetite.
        </p>
      </header>

      <div className="prefs__grid">
        {TOPICS.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            selected={selected.has(topic.id)}
            onToggle={toggle}
          />
        ))}
      </div>

      <footer className="prefs__footer">
        <button className="prefs__skip" onClick={() => onContinue([])}>
          Skip for now
        </button>
        <div className="prefs__progress-wrap">
          <p className="prefs__progress-label">Selection Progress</p>
          <p className="prefs__progress-text">
            {count} of {MIN_TOPICS} minimum topics chosen
          </p>
        </div>
        <button
          className="prefs__continue"
          disabled={!canContinue}
          onClick={() => onContinue(Array.from(selected))}
        >
          Continue Journey &nbsp;→
        </button>
      </footer>
    </main>
  );
}