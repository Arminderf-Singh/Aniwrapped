# AniWrapped 🎌

> Spotify Wrapped, but for anime. Visualise your MAL watching history with stats, score analytics, a GitHub-style activity heatmap, and your taste profile.

## Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **Standard CSS Modules** (no Tailwind, no CSS-in-JS)
- **MyAnimeList API v2**

## Setup

### 1. Clone & install

```bash
npm install
```

### 2. Get a MAL API key

1. Go to [myanimelist.net/apiconfig](https://myanimelist.net/apiconfig)
2. Click **Create ID**
3. Fill in App Name: `AniWrapped`, App Type: `web`, Redirect URL: `http://localhost:3000`
4. Copy your **Client ID**

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Open `.env.local` and paste your Client ID:

```
MAL_CLIENT_ID=your_client_id_here
```

> **Note:** `MAL_CLIENT_SECRET` is only needed for OAuth (user login). For public list access, Client ID alone is sufficient.

### 4. Run

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000), enter any MAL username, and explore.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── mal-proxy/route.js      # Proxies MAL API (keeps key server-side)
│   │   └── user-stats/route.js     # Computes all analytics from raw list
│   ├── wrapped/[username]/
│   │   ├── page.js                 # Main stats page
│   │   └── wrapped.module.css
│   ├── page.js                     # Landing / username input
│   └── layout.js
├── components/
│   ├── Dashboard/
│   │   ├── OverviewCards.js        # Animated stat cards
│   │   └── TasteProfile.js         # Archetype + genre pills
│   ├── Charts/
│   │   ├── ScoreChart.js           # Distribution histogram + line chart
│   │   └── GenreChart.js           # Genre bars + studio bubbles
│   └── Timeline/
│       ├── ActivityHeatmap.js      # GitHub-style 52-week heatmap
│       └── TimelineCards.js        # Anime cards grouped by year
└── styles/
    └── globals.css                 # Design tokens + global styles
```

## Features

| Feature | Description |
|---|---|
| Overview Cards | Total days, episodes, hours, mean score, completion rate |
| Score Distribution | Histogram coloured by score (1–10) |
| Score Over Time | SVG line chart of monthly score averages |
| Genre Breakdown | Horizontal bar chart of top 12 genres |
| Studio Bubbles | Bubble grid sized by frequency |
| Activity Heatmap | 52-week GitHub-style grid (intensity by completions) |
| Timeline Cards | Anime cards grouped by year with cover art, score, status |
| Taste Profile | Rule-based archetype + rating style + commitment traits |

## Adding AI-Generated Insights (optional)

The `tasteProfile` in `/api/user-stats/route.js` is currently rule-based. To upgrade to AI-generated summaries, replace the `generateTasteProfile()` function with a call to an LLM passing the computed stats:

```js
// Example: call OpenAI/Anthropic with stats context
const prompt = `Based on these anime stats: ${JSON.stringify(stats)}, write a 2-sentence taste profile...`;
```

## Roadmap

- [ ] User comparison (taste similarity score)
- [ ] Seasonal watching trends
- [ ] Share card (og:image generation)
- [ ] OAuth login for private lists
- [ ] Caching with Redis/Vercel KV
