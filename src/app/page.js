'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const TAGLINES = [
  'How many hours did you actually lose this year?',
  'Your top genre might surprise you.',
  'That one show you rated 10, still worth it?',
  'More episodes than you think. Way more.',
  'Your taste profile awaits.',
  'Every anime you watched, mapped out.',
  'Find out what kind of watcher you really are.',
];

const MARQUEE_ITEMS = [
  { label: 'Watch time',       color: '#e8a0b0' },
  { label: 'Score analytics',  color: '#d4843a' },
  { label: 'Watch timeline',   color: '#8878b8' },
  { label: 'Genre breakdown',  color: '#6a8c5a' },
  { label: 'Taste profile',    color: '#7aaed4' },
  { label: 'Top studios',      color: '#c4607a' },
  { label: 'Activity heatmap', color: '#d4843a' },
  { label: 'Completion rate',  color: '#6a8c5a' },
];

const DOUBLED = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

export default function HomePage() {
  const [username, setUsername]       = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [shaking, setShaking]         = useState(false);
  const [exiting, setExiting]         = useState(false);
  const [taglineIdx, setTaglineIdx]   = useState(0);
  const [taglineFade, setTaglineFade] = useState(true);
  const router   = useRouter();
  const inputRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineFade(false);
      setTimeout(() => {
        setTaglineIdx(i => (i + 1) % TAGLINES.length);
        setTaglineFade(true);
      }, 400);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  function triggerShake() {
    setShaking(true);
    setTimeout(() => setShaking(false), 600);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/mal-proxy?username=${encodeURIComponent(trimmed)}`);
      if (res.status === 404) {
        setError('User not found on MyAnimeList.');
        setLoading(false);
        triggerShake();
        return;
      }
      if (!res.ok) {
        setError('Something went wrong. Check your API key.');
        setLoading(false);
        triggerShake();
        return;
      }
      setExiting(true);
      setTimeout(() => {
        router.push(`/wrapped/${encodeURIComponent(trimmed)}`);
      }, 500);
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
      triggerShake();
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.vignette} />
      <div className={styles.watermark} />
      <div className={styles.watermark2} />
      <div className={styles.watermark3} />

      <div className={`${styles.hero} ${exiting ? styles.heroExit : ''}`}>
        <div className={styles.topRule}>
          <span>アニメ振り返り</span>
        </div>

        <h1 className={styles.title}>
          <span className={styles.titleJa}>あなたのアニメの旅</span>
          <span className={styles.titleEn}>
            Ani<span className={styles.titleAccent}>Wrapped</span>
          </span>
          
        </h1>

        <p className={styles.subtitle}><br />
          Your anime journey, told as a story.<br />
          Enter your MyAnimeList username to begin.
        </p>

        <p className={`${styles.tagline} ${taglineFade ? styles.taglineVisible : styles.taglineHidden}`}>
          {TAGLINES[taglineIdx]}
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={`${styles.inputWrapper} ${shaking ? styles.shake : ''}`}>
            <span className={styles.inputLabel}>@</span>
            <input
              ref={inputRef}
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              placeholder="your MAL username"
              className={styles.input}
              disabled={loading}
              autoComplete="off"
              spellCheck="false"
            />
          </div>
          <button type="submit" className={styles.btn} disabled={loading || !username.trim()}>
            {loading ? (
              <span className={styles.loadingDots}><i/><i/><i/></span>
            ) : (
              <span>Unwrap my story</span>
            )}
          </button>
        </form>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.marqueeWrap}>
          <div className={styles.marqueeTrack}>
            {DOUBLED.map((item, i) => (
              <span key={i} className={styles.mItem}>
                <span
                  className={styles.mDot}
                  style={{ background: item.color }}
                />
                {item.label}
                <span className={styles.mSep}>·</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <footer className={`${styles.footer} ${exiting ? styles.heroExit : ''}`}>
      
      </footer>
    </main>
  );
}