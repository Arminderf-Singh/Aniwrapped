'use client';
import styles from './TasteProfile.module.css';

const GENRE_COLORS = {
  Action:'#d4843a', Drama:'#c4607a', Comedy:'#d4b040', Romance:'#e8a0b0',
  Fantasy:'#8878b8', 'Sci-Fi':'#7aaed4', Horror:'#8a5050', Psychological:'#7878a8',
  Adventure:'#6a8c5a', Thriller:'#b86060', Mystery:'#7aaed4', default:'#8878b8',
};

export default function TasteProfile({ profile }) {
  const { archetype, description, ratingStyle, commitment, topGenres } = profile;
  return (
    <div className={styles.wrapper}>
      <div className={styles.archetypeCard}>
        <div className={styles.archetypeInner}>
          <span className={styles.archetypeIcon}>✦</span>
          <div>
            <h2 className={styles.archetype + ' ' + styles.font_display}>{archetype}</h2>
            <p className={styles.description}>{description}</p>
          </div>
        </div>
        <div className={styles.traits}>
          <div className={styles.trait}>
            <span className={styles.traitIcon}>◈</span>
            <span className={styles.traitText}>{ratingStyle}</span>
          </div>
          <div className={styles.trait}>
            <span className={styles.traitIcon}>◉</span>
            <span className={styles.traitText}>{commitment}</span>
          </div>
        </div>
      </div>

      <div className={styles.genrePanel}>
        <p className={styles.genrePanelTitle}>Top genres</p>
        <div className={styles.genrePills}>
          {topGenres.map((g, i) => (
            <span
              key={g}
              className={styles.genrePill}
              style={{ '--pill-color': GENRE_COLORS[g] || GENRE_COLORS.default }}
            >
              {g}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
