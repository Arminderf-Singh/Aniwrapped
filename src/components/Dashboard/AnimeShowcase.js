'use client';
import { useState, useEffect } from 'react';
import styles from './AnimeShowcase.module.css';

// Dynamically compute card width so all 5 cards + tooltips fit the viewport.
// A card is 2:3 aspect ratio. Each card slot = cardHeight + paddingBottom (tooltip buffer).
// Total height used = label(~28px) + 5 * (cardHeight + TOOLTIP_BUFFER)
// We solve for cardHeight, then cardWidth = cardHeight * (2/3).
const TOOLTIP_BUFFER = 68; // px below each card for the hover tooltip
const LABEL_H        = 28; // px for the column label
const COL_PADDING    = 40; // top+bottom padding of the column
const CARD_ASPECT    = 2 / 3;
const MAX_CARD_W     = 110;
const MIN_CARD_W     = 55;

function useCardWidth() {
  const [cardWidth, setCardWidth] = useState(MAX_CARD_W);

  useEffect(() => {
    function recalc() {
      const vh = window.innerHeight;
      const available = vh - COL_PADDING - LABEL_H;
      // Each card takes: cardHeight + TOOLTIP_BUFFER
      // cardHeight = cardWidth / CARD_ASPECT
      // So: 5 * (cardWidth / CARD_ASPECT + TOOLTIP_BUFFER) <= available
      // => cardWidth <= (available / 5 - TOOLTIP_BUFFER) * CARD_ASPECT
      const ideal = (available / 5 - TOOLTIP_BUFFER) * CARD_ASPECT;
      const clamped = Math.max(MIN_CARD_W, Math.min(MAX_CARD_W, Math.floor(ideal)));
      setCardWidth(clamped);
    }

    recalc();
    window.addEventListener('resize', recalc);
    return () => window.removeEventListener('resize', recalc);
  }, []);

  return cardWidth;
}

function PosterColumn({ items, side, label, rankPrefix, scoreKey, cardWidth }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  if (!items || !items.length) return null;

  const TILTS  = ['-5deg', '4deg', '-6deg', '5deg', '-4deg'];
  const SCALES = [1.0, 0.97, 0.94, 0.91, 0.88];
  const NUDGES = side === 'left'
    ? ['0px', '14px', '0px', '14px', '0px']
    : ['0px', '-14px', '0px', '-14px', '0px'];

  // Tooltip buffer scales proportionally but never below 52px
  const tooltipBuffer = Math.max(52, TOOLTIP_BUFFER * (cardWidth / MAX_CARD_W));

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
            width:          `${cardWidth}px`,
            paddingBottom:  `${tooltipBuffer}px`,
          }}
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
  const cardWidth = useCardWidth();

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
          cardWidth={cardWidth}
        />
      )}
      {nextWatch.length > 0 && (
        <PosterColumn
          items={nextWatch}
          side="right"
          label="Next Watch"
          rankPrefix=""
          scoreKey="mean"
          cardWidth={cardWidth}
        />
      )}
    </div>
  );
}