"use client";

import React from "react";

interface WelcomePageProps {
  onGetStarted: () => void;
}

const features = [
  {
    icon: "📱",
    title: "Installable PWA",
    desc: "Experience a native-quality app with one-tap access directly from your home screen.",
  },
  {
    icon: "☁",
    title: "Works offline",
    desc: "Perfect for commutes. Your library is always available, even without a network connection.",
  },
  {
    icon: "⚡",
    title: "Blazing fast",
    desc: "Sub-second loads for a friction-free experience. Designed for the focused reader.",
  },
];

export default function WelcomePage({ onGetStarted }: WelcomePageProps) {
  return (
    <main className="welcome">
      <div className="welcome__inner">
        <div className="welcome__logo-wrap">
          <span className="welcome__logo-icon">⚡</span>
        </div>

        <h1 className="welcome__brand">ReadLite</h1>
        <p className="welcome__tagline">Read anywhere. Instantly.</p>

        <div className="welcome__cards">
          {features.map((f) => (
            <div className="welcome__card" key={f.title}>
              <div className="welcome__card-icon">{f.icon}</div>
              <p className="welcome__card-title">{f.title}</p>
              <p className="welcome__card-desc">{f.desc}</p>
            </div>
          ))}
        </div>

        <button className="welcome__cta" onClick={onGetStarted}>
          Get Started &nbsp;→
        </button>

        <p className="welcome__version">V 2.4.0 · Zero Latency Edition</p>
      </div>
    </main>
  );
}