// src/app/api/mal-proxy/route.js
// Proxies requests to MAL API to keep client_id server-side

const MAL_BASE = 'https://api.myanimelist.net/v2';
const CLIENT_ID = process.env.MAL_CLIENT_ID;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return Response.json({ error: 'Username required' }, { status: 400 });
  }

  if (!CLIENT_ID) {
    return Response.json({ error: 'MAL_CLIENT_ID not configured' }, { status: 500 });
  }

  try {
    
    const fields = [
      'list_status',
      'num_episodes',
      'genres',
      'studios',
      'start_date',
      'end_date',
      'mean',
      'main_picture',
      'media_type',
      'status',
    ].join(',');

    let allAnime = [];
    let offset = 0;
    const limit = 500;
    let hasMore = true;

    while (hasMore) {
      const url = `${MAL_BASE}/users/${username}/animelist?fields=${fields}&limit=${limit}&offset=${offset}&nsfw=true`;

      const res = await fetch(url, {
        headers: { 'X-MAL-CLIENT-ID': CLIENT_ID },
        next: { revalidate: 300 }, // cache 5 mins
      });

      if (res.status === 404) {
        return Response.json({ error: 'User not found' }, { status: 404 });
      }
      if (!res.ok) {
        const text = await res.text();
        console.error('MAL API error:', res.status, text);
        return Response.json({ error: 'MAL API error', status: res.status }, { status: 502 });
      }

      const data = await res.json();
      allAnime = allAnime.concat(data.data || []);

      // Check if there's more pages
      if (data.paging?.next) {
        offset += limit;
      } else {
        hasMore = false;
      }

      // Safety cap at 2000 entries
      if (allAnime.length >= 2000) break;
    }

    return Response.json({ anime: allAnime, total: allAnime.length });

  } catch (err) {
    console.error('Proxy error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
