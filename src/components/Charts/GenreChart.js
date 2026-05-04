'use client';
import styles from './GenreChart.module.css';

const PALETTE = [
  '#d4843a','#c4607a','#8878b8','#7aaed4','#6a8c5a',
  '#d4b040','#c47060','#7898c8','#80a878','#c47898',
];

export default function GenreChart({ genres, studios }) {
  const maxG = genres[0]?.count || 1;
  return (
    <div className={styles.wrapper}>
      <div className={styles.panel}>
        <h3 className={styles.title}>Top Genres</h3>
        <div className={styles.barList}>
          {genres.map(({ name, count }, i) => (
            <div key={name} className={styles.barRow} style={{ animationDelay: i * 0.04 + 's' }}>
              <span className={styles.barName}>{name}</span>
              <div className={styles.barTrack}>
                <div className={styles.barFill} style={{
                  width: (count / maxG * 100) + '%',
                  background: PALETTE[i % PALETTE.length],
                }} />
              </div>
              <span className={styles.barCount}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.panel}>
        <h3 className={styles.title}>Studios</h3>
        <div className={styles.studioGrid}>
          {studios.map(({ name, count }, i) => (
            <div key={name} className={styles.studioBubble} style={{ animationDelay: i * 0.06 + 's' }}>
              <span className={styles.studioName}>{name}</span>
              <span className={styles.studioCount}>{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
