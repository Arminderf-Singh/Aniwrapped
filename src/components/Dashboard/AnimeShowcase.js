'use client';
import { useState, useEffect } from 'react';
import styles from './AnimeShowcase.module.css';

function PosterColumn({ items, side, label, rankPrefix, scoreKey }) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  if (!items || !items.length) return null;

  // Alternate nudge: even cards push outward, odd cards pull inward
  // This staggers cards so tooltips don't overlap each other
  const TILTS  = ['-5deg', '4deg', '-6deg', '5deg', '-4deg'];
  const SCALES = [1.0, 0.97, 0.94, 0.91, 0.88];
  // Alternate left/right nudge within the column for breathing room
  const NUDGES = side === 'left'
    ? ['0px', '18px', '0px', '18px', '0px']   // odd cards indent right
    : ['0px', '-18px', '0px', '-18px', '0px']; // odd cards indent left

  return (
    <div
      className={`${styles.column} ${side === 'left' ? styles.columnLeft : styles.columnRight}`}
      aria-hidden="true"
    >
      <div className={`${styles.columnLabel} ${visible ? styles.columnLabelVisible : ''}`}>
        {label}
      </div>

      {items.slice(0, 5).map((anime, i) => (
        <div
          key={anime.id}
          className={`${styles.card} ${visible ? styles.cardVisible : ''}`}
          style={{
            '--delay':      `${i * 140}ms`,
            '--rotate':     TILTS[i],
            '--scale':      SCALES[i],
            '--nudge':      NUDGES[i],
            '--initial-tx': side === 'left' ? '-130px' : '130px',
          }}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
        >
          <div className={styles.drifter}>
            <div className={styles.inner}>
              <div className={styles.rankBadge}>{rankPrefix}{i + 1}</div>

              <a
                href={`https://myanimelist.net/anime/${anime.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.posterLink}
              >
              <div className={styles.poster}>
                {anime.imageLarge || anime.image ? (
                  <img
                    src={anime.imageLarge || anime.image}
                    alt={anime.title}
                    className={styles.img}
                    draggable={false}
                  />
                ) : (
                  <div className={styles.imgFallback}><span>?</span></div>
                )}
                <div className={styles.shine} />
              </div>
              </a>

              <div className={styles.info}>
                <p className={styles.infoTitle}>{anime.title}</p>
                {scoreKey === 'userScore' && anime.userScore > 0 && (
                  <p className={styles.infoScore}>★ {anime.userScore}</p>
                )}
                {scoreKey === 'mean' && anime.mean > 0 && (
                  <p className={styles.infoScore}>MAL {anime.mean}</p>
                )}
              </div>

              <div className={styles.fold} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AnimeShowcase({ topAnime = [], nextWatch = [] }) {
  if (!topAnime.length && !nextWatch.length) return null;

  return (
    <div className={styles.root}>
      {topAnime.length > 0 && (
        <PosterColumn
          items={topAnime}
          side="left"
          label="Top 5"
          rankPrefix="#"
          scoreKey="userScore"
        />
      )}
      {nextWatch.length > 0 && (
        <PosterColumn
          items={nextWatch}
          side="right"
          label="Next Watch"
          rankPrefix=""
          scoreKey="mean"
        />
      )}
    </div>
  );
}