// Components/HomeComponents/Herobanner.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './styles/HeroBanner.module.css';
import NeuralNetwork from './NeuralNetwork';
import QuantumField from './QuantumField';
import GeometricGrid from './GeometricGrid';
import type { Article } from '@/app/types/article';

interface HeroBannerProps {
  slides: Article[]; // array of articles to cycle through
}

const VISUALS = [NeuralNetwork, QuantumField, GeometricGrid];

export default function HeroBanner({ slides }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  // If no slides, don't render
  if (!slides || slides.length === 0) return null;

  // Cycle slides
  useEffect(() => {
    const timer = setInterval(() => {
      goTo((current + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [current, slides.length]);

  function goTo(index: number) {
    if (index === current || animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 350);
  }

  const slide = slides[current];
  const Visual = VISUALS[current % VISUALS.length];
  const hasImage = slide.imageUrl && slide.imageUrl.length > 0;

  // Determine background class based on category (for gradient overlay)
  const bgMap: Record<string, string> = {
    'TECHNOLOGY': 'bgTeal',
    'SCIENCE': 'bgPurple',
    'DESIGN': 'bgEmerald',
    'FUTURE': 'bgPurple',
    'PSYCHOLOGY': 'bgTeal',
    'NATURE': 'bgEmerald',
    'BUSINESS': 'bgTeal',
    'CULTURE': 'bgPurple',
  };
  const bgClass = bgMap[slide.category] || 'bgTeal';

  return (
    <div className={`${styles.heroBanner} ${styles[bgClass]}`}>
      <div className={styles.visualWrapper}>
        {hasImage ? (
          <img src={slide.imageUrl} alt={slide.title} className={styles.slideImage} loading="lazy" />
        ) : (
          <Visual />
        )}
      </div>
      <div className={styles.heroOverlay} />
      <div className={`${styles.heroContent} ${animating ? styles.fadeOut : styles.fadeIn}`}>
        <span className={styles.heroBadge}>{slide.category} • {slide.readTime}</span>
        <h1 className={styles.heroTitle}>{slide.title}</h1>
        <p className={styles.heroDescription}>{slide.description}</p>
        <Link href={`/article/${slide.id}`} className={styles.readNowBtn}>
          READ NOW
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      <div className={styles.dots}>
        {slides.map((_, i) => (
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