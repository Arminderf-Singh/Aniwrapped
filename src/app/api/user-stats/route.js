export async function POST(request) {
  try {
    const { anime } = await request.json();
    if (!anime || !Array.isArray(anime)) return Response.json({ error: 'Invalid data' }, { status: 400 });
    return Response.json(computeStats(anime));
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to compute stats' }, { status: 500 });
  }
}

function computeStats(rawAnime) {
  const entries = rawAnime.map(({ node, list_status }) => ({
    id: node.id,
    title: node.title,
    image: node.main_picture?.medium || null,
    imageLarge: node.main_picture?.large || null,
    episodes: node.num_episodes || 0,
    genres: (node.genres || []).map(g => g.name),
    studios: (node.studios || []).map(s => s.name),
    airStart: node.start_date || null,
    airEnd: node.end_date || null,
    mean: node.mean || null,
    mediaType: node.media_type || 'unknown',
    status: list_status?.status || 'unknown',
    userScore: list_status?.score || 0,
    episodesWatched: list_status?.num_episodes_watched || 0,
    watchStart: list_status?.start_date || null,
    watchEnd: list_status?.finish_date || null,
    rewatchCount: list_status?.num_times_rewatched || 0,
  }));

  const completed  = entries.filter(e => e.status === 'completed');
  const watching   = entries.filter(e => e.status === 'watching');
  const dropped    = entries.filter(e => e.status === 'dropped');
  const planToWatch = entries.filter(e => e.status === 'plan_to_watch');

  const totalEpisodes = entries.reduce((s, e) => s + e.episodesWatched, 0);
  const totalHours    = Math.round(totalEpisodes * 24 / 60);
  const totalDays     = Math.round(totalHours / 24 * 10) / 10;

  const scored = entries.filter(e => e.userScore > 0);
  const meanScore = scored.length
    ? Math.round(scored.reduce((s, e) => s + e.userScore, 0) / scored.length * 10) / 10
    : 0;
  const completionRate = entries.length ? Math.round(completed.length / entries.length * 100) : 0;

  // Score distribution
  const scoreDistribution = Array.from({ length: 10 }, (_, i) => ({
    score: i + 1,
    count: scored.filter(e => e.userScore === i + 1).length,
  }));

  // Genre / studio
  const genreMap = {}, studioMap = {};
  entries.forEach(e => {
    e.genres.forEach(g => { genreMap[g] = (genreMap[g] || 0) + 1; });
    e.studios.forEach(s => { studioMap[s] = (studioMap[s] || 0) + 1; });
  });
  const topGenres = Object.entries(genreMap).sort((a,b) => b[1]-a[1]).slice(0,12).map(([name,count]) => ({ name, count }));
  const topStudios = Object.entries(studioMap).sort((a,b) => b[1]-a[1]).slice(0,8).map(([name,count]) => ({ name, count }));

  // Activity heatmap
  const activityMap = {};
  entries.forEach(e => {
    const date = e.watchEnd || e.watchStart;
    if (date) { const k = date.slice(0,10); activityMap[k] = (activityMap[k] || 0) + 1; }
  });
  const activityData = Object.entries(activityMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a,b) => a.date.localeCompare(b.date));

  // Monthly scores
  const monthMap = {};
  entries.filter(e => e.userScore > 0 && (e.watchEnd || e.watchStart)).forEach(e => {
    const m = (e.watchEnd || e.watchStart).slice(0,7);
    if (!monthMap[m]) monthMap[m] = [];
    monthMap[m].push(e.userScore);
  });
  const monthlyScores = Object.entries(monthMap)
    .map(([month, scores]) => ({
      month,
      avg: Math.round(scores.reduce((a,b) => a+b, 0) / scores.length * 10) / 10,
      count: scores.length,
    }))
    .sort((a,b) => a.month.localeCompare(b.month));

  
  // Sorted chronologically by watchStart then watchEnd
  const fullTimeline = entries
    .filter(e => e.watchStart || e.watchEnd)
    .map(e => ({
      id: e.id,
      title: e.title,
      image: e.image,
      imageLarge: e.imageLarge,
      status: e.status,
      score: e.userScore,
      episodes: e.episodes,
      episodesWatched: e.episodesWatched,
      genres: e.genres.slice(0, 3),
      studios: e.studios.slice(0, 2),
      watchStart: e.watchStart,
      watchEnd: e.watchEnd,
      rewatchCount: e.rewatchCount,
    }))
    .sort((a, b) => {
      const da = a.watchStart || a.watchEnd || '';
      const db = b.watchStart || b.watchEnd || '';
      return da.localeCompare(db);
    });

  const tasteProfile = buildTasteProfile({ topGenres, meanScore, completionRate, dropped, entries });

  // Top 5 anime by user score (ties broken by MAL mean score)
  const topAnime = [...entries]
    .filter(e => e.userScore > 0)
    .sort((a, b) => b.userScore - a.userScore || (b.mean || 0) - (a.mean || 0))
    .slice(0, 5)
    .map(e => ({
      id: e.id,
      title: e.title,
      image: e.image,
      imageLarge: e.imageLarge,
      userScore: e.userScore,
      genres: e.genres.slice(0, 2),
    }));

  // Top 5 plan-to-watch anime sorted by MAL mean score
  const nextWatch = [...planToWatch]
    .sort((a, b) => (b.mean || 0) - (a.mean || 0))
    .slice(0, 5)
    .map(e => ({
      id: e.id,
      title: e.title,
      image: e.image,
      imageLarge: e.imageLarge,
      mean: e.mean,
      genres: e.genres.slice(0, 2),
    }));

  return {
    topAnime,
    nextWatch,
    overview: {
      total: entries.length, completed: completed.length, watching: watching.length,
      dropped: dropped.length, planToWatch: planToWatch.length,
      totalEpisodes, totalHours, totalDays, meanScore, completionRate,
      totalRewatches: entries.reduce((s,e) => s + e.rewatchCount, 0),
    },
    scoreDistribution,
    topGenres,
    topStudios,
    activityData,
    fullTimeline,
    monthlyScores,
    tasteProfile,
  };
}

function buildTasteProfile({ topGenres, meanScore, completionRate, dropped, entries }) {
  const top3 = topGenres.slice(0,3).map(g => g.name);
  const top5 = topGenres.slice(0,5).map(g => g.name);

  const has = (...gs) => gs.some(g => top5.includes(g));

  const isDark       = has('Psychological','Horror','Thriller');
  const isDrama      = has('Drama');
  const isAction     = has('Action','Adventure');
  const isRomantic   = has('Romance','Shoujo');
  const isComedy     = has('Comedy');
  const isSliceOfLife= has('Slice of Life');
  const isSci        = has('Sci-Fi','Mecha');
  const isFantasy    = has('Fantasy','Isekai');
  const isMystery    = has('Mystery','Suspense');
  const isSports     = has('Sports');
  const isShounen    = has('Shounen');
  const isSeinen     = has('Seinen');
  const isMaho       = has('Mahou Shoujo','Magical Girl');

  const dropRate       = entries.length ? Math.round(dropped.length / entries.length * 100) : 0;
  const isHarshRater   = meanScore > 0 && meanScore <= 5.5;
  const isGenerousRater= meanScore >= 8.5;
  const isHighCompletion = completionRate >= 85;
  const isDropper      = dropRate >= 20;
  const isRewatcher    = entries.reduce((s,e) => s + e.rewatchCount, 0) > 5;

  // --- Archetype matrix (first match wins) ---
  let archetype, description;

  if (isDark && isMystery) {
    archetype = 'The Obsessive Analyst';
    description = 'You don\'t just watch, you dissect. Every plot twist is a puzzle, every character a suspect.';
  } else if (isDark && !isComedy && !isRomantic) {
    archetype = 'The Dark Connoisseur';
    description = 'Heavy narratives, complex characters, and shows that leave a mark long after the credits roll.';
  } else if (isMystery && !isDark) {
    archetype = 'The Clue Chaser';
    description = 'You live for the reveal. Red herrings don\'t fool you , or at least, that\'s what you tell yourself.';
  } else if (isSci && isAction) {
    archetype = 'The Iron Strategist';
    description = 'Giant robots, faster-than-light logic, and tactical battles. You appreciate the craft behind the chaos.';
  } else if (isSci && !isAction) {
    archetype = 'The Quiet Futurist';
    description = 'You\'re drawn to ideas over explosions , the kind of sci-fi that makes you stare at the ceiling afterward.';
  } else if (isFantasy && isAction && isShounen) {
    archetype = 'The Power Scaler';
    description = 'Levelling up, power systems, and that one fight that gave you chills. You know exactly what you\'re here for.';
  } else if (isFantasy && isRomantic) {
    archetype = 'The Enchanted Dreamer';
    description = 'Magic, longing, and worlds just out of reach. You want the fairy tale , and you want it to hurt a little too.';
  } else if (isFantasy && !isAction) {
    archetype = 'The Worldbuilder';
    description = 'You\'re here for the lore. Maps, magic systems, ancient histories , the deeper the world, the better.';
  } else if (isRomantic && isComedy) {
    archetype = 'The Rom-Com Devotee';
    description = 'Misunderstandings, accidental confessions, and the slow burn that kills you every episode. Worth it every time.';
  } else if (isRomantic && isDrama) {
    archetype = 'The Hopeless Romantic';
    description = 'Slow burns, tearful confessions, and will-they-won\'t-they tension , you feel every moment deeply.';
  } else if (isRomantic) {
    archetype = 'The Soft-Hearted';
    description = 'Love stories hit different for you. You root hard, you feel harder, and you rewatch the good endings.';
  } else if (isSliceOfLife && isComedy) {
    archetype = 'The Good Vibes Curator';
    description = 'Cozy cafés, found family, and shows that make you feel warm inside. You know what you like, and you find it reliably.';
  } else if (isSliceOfLife && !isComedy) {
    archetype = 'The Quiet Observer';
    description = 'You find beauty in ordinary moments. The shows others overlook are often your favourites.';
  } else if (isSports) {
    archetype = 'The Underdog Believer';
    description = 'Every training arc hits. Every loss stings. Every win feels earned. You bleed for the team.';
  } else if (isMaho) {
    archetype = 'The Eternal Optimist';
    description = 'Hope, heart, and transformation sequences. You believe in the power of love and you\'re not sorry about it.';
  } else if (isSeinen && isDrama) {
    archetype = 'The Reflective Viewer';
    description = 'You\'ve graduated past hype , you want shows that say something. Art, maturity, and meaning over flash.';
  } else if (isAction && meanScore >= 7.5 && isHighCompletion) {
    archetype = 'The Hype Enjoyer';
    description = 'Big battles, bigger stakes , you chase spectacle and it rarely disappoints you.';
  } else if (isAction) {
    archetype = 'The Thrill Seeker';
    description = 'Fast pacing, high stakes, and the kind of animation that makes your jaw drop. You watch for the rush.';
  } else if (isGenerousRater && isHighCompletion) {
    archetype = 'The Eternal Optimist';
    description = 'You finish what you start and find something to love in almost everything. That\'s a rare and good thing.';
  } else if (isHarshRater && isDropper) {
    archetype = 'The Ruthless Curator';
    description = 'Your list is lean and deliberate. You cut early, score hard, and your favourites genuinely earned it.';
  } else if (isHarshRater) {
    archetype = 'The Discerning Critic';
    description = 'A high score from you means something. You hold anime to a standard and it shows.';
  } else if (isRewatcher) {
    archetype = 'The Loyal Revisitor';
    description = 'You return to what you love. Your favourites aren\'t just shows , they\'re places you go back to.';
  } else {
    archetype = 'The Eclectic Explorer';
    description = 'Your taste resists categories. You wander across genres, eras, and styles , and that\'s your superpower.';
  }

  const ratingStyle = meanScore >= 8.5 ? 'You rate generously , you see the best in almost every show'
    : meanScore >= 7.5 ? 'You score fairly , high praise is reserved for shows that truly earn it'
    : meanScore <= 5.5 ? 'You\'re a harsh critic , your 8 is everyone else\'s 10'
    : 'You score honestly , neither too harsh nor too lenient';

  const commitment = dropRate < 5  ? 'You almost never drop a show , iron will'
    : dropRate < 15 ? 'You occasionally cut your losses when a show loses you'
    : dropRate < 30 ? 'You drop without much guilt , your time is valuable'
    : 'You curate aggressively , only the strong survive your list';

  return { archetype, description, ratingStyle, commitment, topGenres: top3 };
}
