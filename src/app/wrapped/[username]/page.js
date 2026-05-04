'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import styles from './wrapped.module.css';
import OverviewCards from '../../../components/Dashboard/OverviewCards';
import ScoreChart from '../../../components/Charts/ScoreChart';
import GenreChart from '../../../components/Charts/GenreChart';
import ActivityHeatmap from '../../../components/Timeline/ActivityHeatmap';
import WatchTimeline from '../../../components/Timeline/WatchTimeline';
import TasteProfile from '../../../components/Dashboard/TasteProfile';
import AnimeShowcase from '../../../components/Dashboard/AnimeShowcase';

const LOAD_STEPS = [
  'Fetching your anime list…',
  'Counting the hours…',
  'Mapping your journey…',
  'Finding your favourites…',
  'Almost ready…',
];

export default function WrappedPage() {
  const params = useParams();
  const username = decodeURIComponent(params.username);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loadStep, setLoadStep] = useState(0);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => { i = Math.min(i + 1, LOAD_STEPS.length - 1); setLoadStep(i); }, 1400);

    async function load() {
      try {
        const listRes = await fetch(`/api/mal-proxy?username=${encodeURIComponent(username)}`);
        if (!listRes.ok) { const d = await listRes.json(); throw new Error(d.error || 'Failed to fetch'); }
        const { anime } = await listRes.json();
        const statsRes = await fetch('/api/user-stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ anime }),
        });
        if (!statsRes.ok) throw new Error('Failed to compute stats');
        clearInterval(t);
        setStats(await statsRes.json());
      } catch (err) {
        clearInterval(t);
        setError(err.message || 'Something went wrong.');
      }
    }
    load();
    return () => clearInterval(t);
  }, [username]);

  if (error) return (
    <div className={styles.center}>
      <div className={styles.errorBox}>
        <div className={styles.errorIcon}>✕</div>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <Link href="/" className={styles.backBtn}>← Try again</Link>
      </div>
    </div>
  );

  if (!stats) return (
    <div className={styles.center}>
      <div className={styles.loader}>
        <div className={styles.loaderRing} />
        <div className={styles.loaderInner}>桜</div>
      </div>
      <p className={styles.loadStep}>{LOAD_STEPS[loadStep]}</p>
    </div>
  );

  return (
    <>
    <div className={styles.page}>
      <AnimeShowcase topAnime={stats.topAnime || []} nextWatch={stats.nextWatch || []} />
      <div className={styles.container}>
        <header className={styles.header}>
          <Link href="/" className={styles.backLink}>← AniWrapped</Link>
          <div className={styles.userTag}>
            <span className={styles.userHandle}>@{username}</span>
            <span className={styles.userBadge}>{stats.overview.total} titles</span>
          </div>
        </header>

        <section className={styles.heroSection}>
          <p className={styles.heroEyebrow}>あなたのアニメ振り返り</p>
          <h1 className={styles.heroTitle}>
            {username}'s<br />
            <span className={styles.heroTitleItalic}>anime story</span>
          </h1>
          <p className={styles.heroTagline}>
            {stats.tasteProfile.archetype} , {stats.tasteProfile.description}
          </p>
        </section>

        <Section num="01" title="By the Numbers">
          <OverviewCards overview={stats.overview} />
        </Section>

        <Section num="02" title="Your Taste">
          <TasteProfile profile={stats.tasteProfile} />
        </Section>

        <Section num="03" title="Score History">
          <ScoreChart
            distribution={stats.scoreDistribution}
            monthlyScores={stats.monthlyScores}
            meanScore={stats.overview.meanScore}
          />
        </Section>

        <Section num="04" title="Genres & Studios">
          <GenreChart genres={stats.topGenres} studios={stats.topStudios} />
        </Section>

        <Section num="05" title="Activity Heatmap">
          <ActivityHeatmap activityData={stats.activityData} />
        </Section>

        <Section num="06" title="Your Watch Timeline">
          <WatchTimeline entries={stats.fullTimeline} />
        </Section>

        <footer className={styles.footer}>
          <p>AniWrapped · Powered by MyAnimeList · Not affiliated with MAL</p>
          <button className={styles.contactBtn} onClick={() => setContactOpen(true)}>
            Contact
          </button>
        </footer>
      </div>
    </div>
    {contactOpen && <ContactModal onClose={() => setContactOpen(false)} />}
    </>
  );
}

function ContactModal({ onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose} aria-label="Close">✕</button>
        <div className={styles.modalEyebrow}>Get in touch</div>
        <h2 className={styles.modalTitle}>Contact Me</h2>
        <div className={styles.modalDivider} />
        <ul className={styles.contactList}>
          <li className={styles.contactItem}>
            <span className={styles.contactIcon}>✉</span>
            <div>
              <p className={styles.contactLabel}>Email</p>
              <a href="mailto:hello@example.com" className={styles.contactValue}></a>
            </div>
          </li>
          <li className={styles.contactItem}>
            <span className={styles.contactIcon}>𝕏</span>
            <div>
              <p className={styles.contactLabel}>Twitter / X</p>
              <a href="https://twitter.com/yourhandle" target="_blank" rel="noopener noreferrer" className={styles.contactValue}></a>
            </div>
          </li>
          <li className={styles.contactItem}>
            <span className={styles.contactIcon}>⌨</span>
            <div>
              <p className={styles.contactLabel}>GitHub</p>
              <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" className={styles.contactValue}></a>
            </div>
          </li>
          <li className={styles.contactItem}>
            <span className={styles.contactIcon}></span>
            <div>
              <p className={styles.contactLabel}></p>
              <p className={styles.contactValue}></p>
            </div>
          </li>
        </ul>
        <p className={styles.modalNote}>Built with ❤ and too many late nights watching anime.</p>
      </div>
    </div>
  );
}

function Section({ num, title, children }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionNum}>{num}</span>
        <span className={styles.sectionTitle}>{title}</span>
        <div className={styles.sectionLine} />
      </div>
      {children}
    </section>
  );
}
