'use client';

import { useState, useEffect } from 'react';
import styles from './styles/HeroBanner.module.css';
import NeuralNetwork from './NeuralNetwork';
import QuantumField from './QuantumField';
import GeometricGrid from './GeometricGrid';

interface Slide {
  badge: string;
  title: string;
  description: string;
  bgClass: string;
  // Drop your image URL here — leave as empty string to show the SVG visual instead
  imageUrl?: string;
}

const SLIDES: Slide[] = [
  {
    badge: 'TECHNOLOGY • 8 MIN READ',
    title: 'The Silicon Mind: Ethics of Synthetic Cognition',
    description: 'Exploring the blurred lines between programmed response and genuine consciousness in the next generation of AI.',
    bgClass: 'bgTeal',
    imageUrl: '', // e.g. '/images/silicon-mind.jpg'
  },
  {
    badge: 'SCIENCE • 6 MIN READ',
    title: 'Quantum Entanglement and the Future of Computing',
    description: 'How physicists are harnessing the strange behaviour of particles to build computers that defy classical logic.',
    bgClass: 'bgPurple',
    imageUrl: '', // e.g. '/images/quantum.jpg'
  },
  {
    badge: 'DESIGN • 5 MIN READ',
    title: 'The Language of Invisible Interfaces',
    description: 'When design disappears entirely, what remains? A deep look at zero-UI and ambient computing paradigms.',
    bgClass: 'bgEmerald',
    imageUrl: '', // e.g. '/images/invisible-ui.jpg'
  },
];

const VISUALS = [NeuralNetwork, QuantumField, GeometricGrid];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((current + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [current]);

  function goTo(index: number) {
    if (index === current || animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 350);
  }

  const slide = SLIDES[current];
  const Visual = VISUALS[current];

  return (
    <div className={`${styles.heroBanner} ${styles[slide.bgClass]}`}>

      {/* Right side: real image OR SVG visual */}
      <div className={styles.visualWrapper}>
        {slide.imageUrl ? (
          <img
            src={slide.imageUrl}
            alt={slide.title}
            className={styles.slideImage}
          />
        ) : (
          <Visual />
        )}
      </div>

      {/* Left-to-right gradient so text stays legible */}
      <div className={styles.heroOverlay} />

      {/* Slide content */}
      <div className={`${styles.heroContent} ${animating ? styles.fadeOut : styles.fadeIn}`}>
        <span className={styles.heroBadge}>{slide.badge}</span>
        <h1 className={styles.heroTitle}>{slide.title}</h1>
        <p className={styles.heroDescription}>{slide.description}</p>
        <button className={styles.readNowBtn}>
          READ NOW
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Dot indicators */}
      <div className={styles.dots}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={i === current ? styles.dotActive : styles.dot}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}