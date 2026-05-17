# AniWrapped -- Your Anime Year in Review

A personalized yearly recap for MyAnimeList users, inspired by Spotify Wrapped.

**Live site: [aniwrapped.com](https://aniwrapped.com)**

---

## What is AniWrapped?

AniWrapped transforms your MyAnimeList data into a beautiful, interactive year-in-review experience. See your watch history, genre preferences, ratings, and viewing trends all in one place.

Built as a side project, it grew from 0 to 1,000+ users within a week of launch.

---

## Features

- Personalized analytics including watch counts, hours logged, genre breakdowns, and rating distributions
- Interactive visuals with dynamic charts and animated stat cards
- Fully responsive layout optimized for desktop and mobile
- Optimized async data fetching under real traffic load
- MAL API integration that pulls your real watch history directly from MyAnimeList

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Tailwind CSS |
| Build Tool | Vite |
| APIs | MyAnimeList (MAL) REST API |
| Hosting | Netlify, Cloudflare |

---

## Getting Started

```bash
git clone https://github.com/Arminderf-Singh/Aniwrapped.git
cd Aniwrapped
npm install
npm run dev
```

You will need a MyAnimeList API client ID. Create one at [myanimelist.net/apiconfig](https://myanimelist.net/apiconfig) and add it to a `.env` file:

```env
VITE_MAL_CLIENT_ID=your_client_id_here
```

---

## Screenshots

> Add screenshots here

---

## What I Learned

- Scaling API-driven applications beyond the happy path
- Optimising async data fetching under unpredictable load spikes
- Designing experiences that feel personal at scale
- Managing deployment workflows under live traffic

---

## License

MIT
