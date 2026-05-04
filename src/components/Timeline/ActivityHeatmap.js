'use client';
import { useMemo } from 'react';
import styles from './ActivityHeatmap.module.css';

function getIntensity(count, max) {
  if (count === 0) return 0;
  const pct = count / max;
  if (pct < 0.25) return 1;
  if (pct < 0.5) return 2;
  if (pct < 0.75) return 3;
  return 4;
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function ActivityHeatmap({ activityData }) {
  const { weeks, monthLabels, totalActive, maxCount, peakDate } = useMemo(() => {
    if (!activityData || activityData.length === 0) {
      return { weeks: [], monthLabels: [], totalActive: 0, maxCount: 1, peakDate: null };
    }

    // Build map of date->count
    const map = {};
    let maxCount = 0;
    let peakDate = null;
    activityData.forEach(({ date, count }) => {
      map[date] = count;
      if (count > maxCount) { maxCount = count; peakDate = date; }
    });

    // Generate last 52 weeks
    const today = new Date();
    const endDate = new Date(today);
    // Start from Sunday 52 weeks ago
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 52 * 7);
    // Align to Sunday
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const weeks = [];
    let current = new Date(startDate);
    let lastMonth = -1;
    const monthLabels = [];

    while (current <= endDate) {
      const week = [];
      const weekStart = new Date(current);

      // Track month label position
      if (current.getMonth() !== lastMonth) {
        monthLabels.push({ label: MONTHS[current.getMonth()], weekIndex: weeks.length });
        lastMonth = current.getMonth();
      }

      for (let d = 0; d < 7; d++) {
        const dateStr = current.toISOString().slice(0, 10);
        const count = map[dateStr] || 0;
        week.push({ date: dateStr, count });
        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
    }

    const totalActive = activityData.reduce((s, d) => s + d.count, 0);
    return { weeks, monthLabels, totalActive, maxCount, peakDate };
  }, [activityData]);

  if (weeks.length === 0) {
    return (
      <div className={`card ${styles.empty}`}>
        <p>No activity data with dates available.</p>
      </div>
    );
  }

  return (
    <div className={`card ${styles.wrapper}`}>
      <div className={styles.header}>
        <div>
          <h3 className={`${styles.title} font-display`}>Activity Map</h3>
          <p className={styles.subtitle}>
            {totalActive} entries logged with dates
            {peakDate && ` · Peak: ${peakDate}`}
          </p>
        </div>
        <div className={styles.legend}>
          <span className={styles.legendLabel}>Less</span>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`${styles.legendCell} ${styles[`intensity${i}`]}`} />
          ))}
          <span className={styles.legendLabel}>More</span>
        </div>
      </div>

      <div className={styles.heatmapScroll}>
        <div className={styles.heatmap}>
          {/* Day labels */}
          <div className={styles.dayLabels}>
            {DAYS.map((d, i) => (
              <span key={d} className={styles.dayLabel} style={{ opacity: i % 2 === 0 ? 1 : 0 }}>
                {d}
              </span>
            ))}
          </div>

          {/* Grid */}
          <div className={styles.grid}>
            {/* Month labels */}
            <div className={styles.monthRow}>
              {weeks.map((_, wi) => {
                const label = monthLabels.find((m) => m.weekIndex === wi);
                return (
                  <div key={wi} className={styles.monthCell}>
                    {label && <span className={styles.monthLabel}>{label.label}</span>}
                  </div>
                );
              })}
            </div>

            {/* Weeks */}
            <div className={styles.weeksRow}>
              {weeks.map((week, wi) => (
                <div key={wi} className={styles.weekCol}>
                  {week.map(({ date, count }) => (
                    <div
                      key={date}
                      className={`${styles.cell} ${styles[`intensity${getIntensity(count, maxCount)}`]}`}
                      title={`${date}: ${count} anime`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
