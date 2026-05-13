'use client';
import { useState, useMemo } from 'react';
import styles from './WatchTimeline.module.css';

const STATUS_META = {
  completed:    { label: 'Completed',  color: '#6a8c5a', dot: '●' },
  watching:     { label: 'Watching',   color: '#7aaed4', dot: '◐' },
  on_hold:      { label: 'On Hold',    color: '#d4843a', dot: '◑' },
  dropped:      { label: 'Dropped',    color: '#c4607a', dot: '○' },
  plan_to_watch:{ label: 'Plan',       color: '#b8a898', dot: '◌' },
};

const SCORE_LABEL = ['','Awful','Bad','Weak','Poor','Average','Fine','Good','Great','Excellent','Masterpiece'];

function formatMonth(dateStr) {
  if (!dateStr) return null;
  try {
    // Handle both YYYY-MM and YYYY-MM-DD
    const normalized = dateStr.length === 7 ? dateStr + '-02' : dateStr;
    return new Date(normalized).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch { return dateStr; }
}

function getDurationMonths(start, end) {
  if (!start || !end) return 0;
  try {
    const normalize = d => d.length === 7 ? d + '-02' : d;
    const s = new Date(normalize(start));
    const e = new Date(normalize(end));
    return (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  } catch { return 0; }
}

export default function WatchTimeline({ entries }) {
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const { grouped, allMonths } = useMemo(() => {
    const filtered = filter === 'all' ? entries : entries.filter(e => e.status === filter);
    const map = {};
    filtered.forEach(e => {
      const raw = e.watchEnd || e.watchStart || '';
      const month = raw.slice(0, 7);
      if (!month) return;
      if (!map[month]) map[month] = [];
      map[month].push(e);
    });
    const months = Object.keys(map).sort((a, b) => b.localeCompare(a));
    return { grouped: map, allMonths: months };
  }, [entries, filter]);

  const statusCounts = useMemo(() => {
    const c = {};
    entries.forEach(e => { c[e.status] = (c[e.status] || 0) + 1; });
    return c;
  }, [entries]);

  if (!entries || entries.length === 0) {
    return (
      <div className={"card " + styles.empty}>
        <p>No entries with watch dates found. Make sure your MAL list is set to public.</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.filters}>
        {['all','completed','watching','dropped'].map(key => (
          <button
            key={key}
            className={styles.filterBtn + (filter === key ? ' ' + styles.active : '')}
            onClick={() => setFilter(key)}
          >
            {key === 'all' ? 'All' : STATUS_META[key]?.label || key}
            {key !== 'all' && statusCounts[key] ? (
              <span className={styles.filterCount}>{statusCounts[key]}</span>
            ) : null}
          </button>
        ))}
      </div>

      <div className={styles.timeline}>
        {allMonths.length === 0 && (
          <p className={styles.noResults}>No entries match this filter.</p>
        )}

        {allMonths.map((month, mi) => {
          const items = grouped[month];
          // Stagger each month block and its entries for a cascading effect
          const blockDelay = `${mi * 60}ms`;

          return (
            <div
              key={month}
              className={styles.monthBlock}
              style={{ '--block-delay': blockDelay }}
            >
              <div className={styles.monthMarker}>
                <div className={styles.monthLine} />
                <div className={styles.monthDot} />
                <span className={styles.monthLabel}>{formatMonth(month)}</span>
                <span className={styles.monthCount}>{items.length} {items.length === 1 ? 'title' : 'titles'}</span>
              </div>

              <div className={styles.entries}>
                {items.map((entry, i) => {
                  const sm = STATUS_META[entry.status] || { label: entry.status, color: '#b8a898', dot: '○' };
                  const key = month + '-' + i;
                  const isOpen = expanded === key;
                  const durMonths = getDurationMonths(entry.watchStart, entry.watchEnd);
                  const hasArc = entry.watchStart && entry.watchEnd && durMonths > 0;
                  // Stagger each entry within the month
                  const entryDelay = `${mi * 60 + i * 50}ms`;

                  return (
                    <div
                      key={key}
                      className={styles.entry + (isOpen ? ' ' + styles.entryOpen : '')}
                      style={{ '--entry-delay': entryDelay }}
                      onClick={() => setExpanded(isOpen ? null : key)}
                    >
                      <div className={styles.entryLeft}>
                        <div className={styles.coverWrap}>
                          {entry.image ? (
                            <img src={entry.image} alt={entry.title} className={styles.cover} loading="lazy" />
                          ) : (
                            <div className={styles.coverPlaceholder}><span>無</span></div>
                          )}
                          {entry.score > 0 && (
                            <div className={styles.scoreBadge} style={{ background: sm.color }}>
                              {entry.score}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className={styles.entryBody}>
                        <div className={styles.entryTop}>
                          <h4 className={styles.entryTitle}>{entry.title}</h4>
                          <span className={styles.entryStatus} style={{ color: sm.color }}>
                            {sm.dot} {sm.label}
                          </span>
                        </div>

                        {/* Date arc */}
                        {hasArc ? (
                          <div className={styles.dateArc}>
                            <span className={styles.dateFrom}>{formatMonth(entry.watchStart)}</span>
                            <div className={styles.arcTrack}>
                              <div className={styles.arcFill} style={{
                                background: sm.color,
                                width: Math.min(durMonths * 12, 100) + '%'
                              }} />
                            </div>
                            <span className={styles.dateTo}>{formatMonth(entry.watchEnd)}</span>
                            <span className={styles.durLabel}>
                              {durMonths === 1 ? '1 mo' : durMonths + ' mo'}
                            </span>
                          </div>
                        ) : (
                          <div className={styles.dateSimple}>
                            {entry.watchEnd ? formatMonth(entry.watchEnd) : entry.watchStart ? 'Started ' + formatMonth(entry.watchStart) : ''}
                          </div>
                        )}

                        {isOpen && entry.genres && entry.genres.length > 0 && (
                          <div className={styles.genres}>
                            {entry.genres.map(g => (
                              <span key={g} className={styles.genre}>{g}</span>
                            ))}
                          </div>
                        )}

                        {isOpen && entry.score > 0 && (
                          <div className={styles.scoreLabel} style={{ color: sm.color }}>
                            Rated {entry.score}/10 , {SCORE_LABEL[entry.score]}
                          </div>
                        )}
                      </div>

                      <div className={styles.caret + (isOpen ? ' ' + styles.caretOpen : '')}>›</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <p className={styles.hint}>
        Entries without recorded dates are not shown in the timeline.
      </p>
    </div>
  );
}
