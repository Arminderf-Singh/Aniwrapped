'use client';
import { useEffect, useRef } from 'react';
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
  { key: 'totalDays',     label: 'Days watched',        suffix: 'd',   accent: '#e8a0b0', decimals: true },
  { key: 'totalEpisodes', label: 'Episodes',             suffix: '',    accent: '#d4843a' },
  { key: 'totalHours',    label: 'Hours',                suffix: 'h',   accent: '#8878b8' },
  { key: 'total',         label: 'Total anime',          suffix: '',    accent: '#7aaed4' },
  { key: 'completed',     label: 'Completed',            suffix: '',    accent: '#6a8c5a' },
  { key: 'meanScore',     label: 'Mean score',           suffix: '/10', accent: '#d4843a', decimals: true },
  { key: 'completionRate',label: 'Completion rate',      suffix: '%',   accent: '#e8a0b0' },
  { key: 'watching',      label: 'Currently watching',   suffix: '',    accent: '#7aaed4' },
  { key: 'dropped',       label: 'Dropped',              suffix: '',    accent: '#c4607a' },
];

function StatCard({ value, label, suffix, accent, idx }) {
  const ref = useCountUp(typeof value === 'number' ? value : 0);
  const display = typeof value === 'number' ? value : 0;

  return (
    <div className={styles.statCard} style={{ '--accent': accent }} data-idx={idx}>
      <div className={styles.accentBar} style={{ background: accent }} />
      <div className={styles.value} ref={ref}>{Math.round(display).toLocaleString()}{suffix}</div>
      <div className={styles.label}>{label}</div>
    </div>
  );
}

export default function OverviewCards({ overview }) {
  return (
    <div className={styles.grid}>
      {CARDS.map(({ key, label, suffix, accent, decimals }, i) => (
        <StatCard
          key={key}
          value={overview[key] ?? 0}
          label={label}
          suffix={suffix}
          accent={accent}
          idx={i + 1}
        />
      ))}
    </div>
  );
}
