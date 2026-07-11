// Components/HomeComponents/Herobanner.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './styles/HeroBanner.module.css';
import NeuralNetwork from './NeuralNetwork';
import QuantumField from './QuantumField';
import GeometricGrid from './GeometricGrid';
import type { Article } from '@/app/types/article';
import { isDataSaverActive } from '@/lib/prefetch';

interface HeroBannerProps {
  slides: Article[]; // array of articles to cycle through
}

const VISUALS = [NeuralNetwork, QuantumField, GeometricGrid];

export default function HeroBanner({ slides }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const router = useRouter();
  const hasSlides = slides && slides.length > 0;

  function goTo(index: number) {
    if (index === current || animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 350);
  }

  // Cycle slides
  useEffect(() => {
    if (!hasSlides) return;
    const timer = setInterval(() => {
      goTo((current + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [current, hasSlides, slides.length]);

  // Warm the browser's image cache for the next slide before it's shown, so
  // rotation never reveals a blank/loading image.
  useEffect(() => {
    if (!hasSlides || isDataSaverActive()) return;
    const next = slides[(current + 1) % slides.length];
    if (next?.imageUrl) {
      const img = new window.Image();
      img.src = next.imageUrl;
    }
  }, [current, hasSlides, slides]);

  // The currently-highlighted slide is prominent enough to warrant an
  // unconditional prefetch (unlike card grids, which are hover-gated).
  useEffect(() => {
    if (!hasSlides || isDataSaverActive()) return;
    router.prefetch(`/article/${encodeURIComponent(slides[current].id)}`);
  }, [current, hasSlides, slides, router]);

  // If no slides, don't render (after all hooks, to keep hook order stable)
  if (!hasSlides) return null;

  const slide = slides[current];
  const Visual = VISUALS[current % VISUALS.length];
  const hasImage = slide.imageUrl && slide.imageUrl.length > 0;

  // Determine background class based on category (for gradient overlay)
  const bgMap: Record<string, string> = {
    'TECHNOLOGY': 'bgTeal',
    'SCIENCE': 'bgPurple',
    'DESIGN': 'bgEmerald',
    'POLITICS': 'bgPurple',
    'PSYCHOLOGY': 'bgTeal',
    'NATURE': 'bgEmerald',
    'BUSINESS': 'bgTeal',
    'CULTURE': 'bgPurple',
    'ENTERTAINMENT': 'bgPurple',
    'HEALTH': 'bgEmerald',
    'WORLD': 'bgTeal',
    'SPORTS': 'bgEmerald',
  };
  const bgClass = bgMap[slide.category] || 'bgTeal';

  return (
    <div className={`${styles.heroBanner} ${styles[bgClass]}`}>
      <div className={styles.visualWrapper}>
        {hasImage ? (
          <Image
            src={slide.imageUrl as string}
            alt={slide.title}
            fill
            sizes="(max-width: 640px) 100vw, 62vw"
            className={styles.slideImage}
            priority={current === 0}
            fetchPriority={current === 0 ? 'high' : 'auto'}
          />
        ) : (
          <Visual />
        )}
      </div>
      <div className={styles.heroOverlay} />
      <div className={`${styles.heroContent} ${animating ? styles.fadeOut : styles.fadeIn}`}>
        <span className={styles.heroBadge}>{slide.category} • {slide.readTime}</span>
        <h1 className={styles.heroTitle}>{slide.title}</h1>
        <p className={styles.heroDescription}>{slide.description}</p>
        <Link href={`/article/${encodeURIComponent(slide.id)}`} className={styles.readNowBtn}>
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