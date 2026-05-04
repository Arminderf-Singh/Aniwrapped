'use client';
import { useMemo } from 'react';
import styles from './ScoreChart.module.css';

// Warm palette for scores 1-10
const SCORE_COLORS = {
  1:'#c45050', 2:'#c86850', 3:'#c88050', 4:'#c8a050',
  5:'#b8b850', 6:'#90a850', 7:'#70a870', 8:'#50a890', 9:'#50a8b8', 10:'#6a8ccc',
};

export default function ScoreChart({ distribution, monthlyScores, meanScore }) {
  const maxCount = Math.max(...distribution.map(d => d.count), 1);

  const linePath = useMemo(() => {
    if (!monthlyScores || monthlyScores.length < 2) return null;
    const W = 600, H = 120, PAD = 20;
    const scores = monthlyScores.map(m => m.avg);
    const minS = Math.min(...scores), maxS = Math.max(...scores);
    const range = maxS - minS || 1;
    const pts = monthlyScores.map((m, i) => {
      const x = PAD + (i / (monthlyScores.length - 1)) * (W - PAD * 2);
      const y = H - PAD - ((m.avg - minS) / range) * (H - PAD * 2);
      return [x, y];
    });
    const line = 'M ' + pts.map(p => p.join(',')).join(' L ');
    const area = `M ${PAD},${H-PAD} ` + pts.map(p => p.join(',')).join(' L ') + ` ${W-PAD},${H-PAD} Z`;
    return { line, area, pts, W, H };
  }, [monthlyScores]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.chart}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>Score Distribution</h3>
          <div className={styles.meanBadge}>avg <strong>{meanScore}</strong>/10</div>
        </div>
        <div className={styles.histogram}>
          {distribution.map(({ score, count }) => (
            <div key={score} className={styles.bar} title={`${score}/10 , ${count} anime`}>
              <div className={styles.barFill} style={{
                height: `${Math.max(count / maxCount * 100, count > 0 ? 3 : 0)}%`,
                background: SCORE_COLORS[score],
              }} />
              {count > 0 && <div className={styles.barCount}>{count}</div>}
              <div className={styles.barLabel} style={{ color: SCORE_COLORS[score] }}>{score}</div>
            </div>
          ))}
        </div>
      </div>

      {linePath && monthlyScores.length >= 3 && (
        <div className={styles.chart}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Score Over Time</h3>
            <div className={styles.meanBadge}>{monthlyScores.length} months</div>
          </div>
          <div className={styles.lineChartWrap}>
            <svg viewBox={`0 0 ${linePath.W} ${linePath.H}`} className={styles.lineChart} preserveAspectRatio="none">
              <defs>
                <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d4843a" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#d4843a" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon points={linePath.area.replace('M ','').replace(' Z','')} fill="url(#lg)" />
              <path d={linePath.line} fill="none" stroke="#d4843a" strokeWidth="2" />
              {linePath.pts.map(([x,y],i) => (
                <circle key={i} cx={x} cy={y} r="3" fill="#d4843a" opacity="0.7" />
              ))}
            </svg>
            <div className={styles.xAxis}>
              {[monthlyScores[0], monthlyScores[Math.floor(monthlyScores.length/2)], monthlyScores[monthlyScores.length-1]].map(m => (
                <span key={m.month} className={styles.xLabel}>{m.month.slice(0,7)}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
