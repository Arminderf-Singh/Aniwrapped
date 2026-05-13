'use client';
import { useEffect, useRef, useState } from 'react';
import styles from './OverviewCards.module.css';

function useCountUp(target, duration = 1400) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !target) return;
    let start = null;
    const step = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      if (ref.current) ref.current.textContent = Math.round(target * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return ref;
}

const CARDS = [
  { key: 'totalDays',     label: 'Days watched',        suffix: 'd',   accent: '#e8a0b0' },
  { key: 'totalEpisodes', label: 'Episodes',             suffix: '',    accent: '#d4843a' },
  { key: 'totalHours',    label: 'Hours',                suffix: 'h',   accent: '#8878b8' },
  { key: 'total',         label: 'Total anime',          suffix: '',    accent: '#7aaed4' },
  { key: 'completed',     label: 'Completed',            suffix: '',    accent: '#6a8c5a' },
  { key: 'meanScore',     label: 'Mean score',           suffix: '/10', accent: '#d4843a' },
  { key: 'completionRate',label: 'Completion rate',      suffix: '%',   accent: '#e8a0b0' },
  { key: 'watching',      label: 'Currently watching',   suffix: '',    accent: '#7aaed4' },
  { key: 'dropped',       label: 'Dropped',              suffix: '',    accent: '#c4607a' },
];

// Phases: 'hidden' → cards invisible; 'entering' → stagger animation plays;
// 'visible' → animation class removed so hover transitions work normally.
function StatCard({ value, label, suffix, accent, phase, enterDelay }) {
  const countRef = useCountUp(typeof value === 'number' ? value : 0);
  const display  = typeof value === 'number' ? value : 0;

  const isEntering = phase === 'entering';
  const isHidden   = phase === 'hidden';

  return (
    <div
      className={`${styles.statCard} ${isEntering ? styles.statCardIn : ''}`}
      style={{
        '--accent':      accent,
        '--enter-delay': isEntering ? `${enterDelay}ms` : undefined,
        opacity:         isHidden ? 0 : undefined,
      }}
    >
      <div className={styles.accentBar} />
      <div className={styles.value} ref={countRef}>{Math.round(display).toLocaleString()}{suffix}</div>
      <div className={styles.label}>{label}</div>
    </div>
  );
}

export default function OverviewCards({ overview }) {
  const gridRef  = useRef(null);
  const [phase, setPhase] = useState('hidden');

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          obs.disconnect();
          setPhase('entering');
          // After all cards finish entering, lift to visible so hover works
          const maxDelay = (CARDS.length - 1) * 65 + 580;
          setTimeout(() => setPhase('visible'), maxDelay);
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(grid);
    return () => obs.disconnect();
  }, []);

  return (
    <div className={styles.grid} ref={gridRef}>
      {CARDS.map(({ key, label, suffix, accent }, i) => (
        <StatCard
          key={key}
          value={overview[key] ?? 0}
          label={label}
          suffix={suffix}
          accent={accent}
          phase={phase}
          enterDelay={i * 65}
        />
      ))}
    </div>
  );
}
