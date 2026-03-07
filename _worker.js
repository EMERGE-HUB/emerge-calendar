const R2_BASE = 'https://pub-577ff589d29c4ebe9d2ea393dcf228f1.r2.dev';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Proxy /wp1.ics through /wp9.ics directly from R2
    if (/^\/wp[1-9]\.ics$/.test(path)) {
      const r2url = `${R2_BASE}${path}`;
      const r2res = await fetch(r2url, {
        headers: { 'User-Agent': 'EMERGE-Calendar-Proxy/1.0' }
      });

      if (!r2res.ok) {
        return new Response(`Calendar feed not found: ${path}`, { status: 404 });
      }

      // Stream the response with correct ICS headers
      return new Response(r2res.body, {
        status: 200,
        headers: {
          'Content-Type':  'text/calendar; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    // For all other requests, pass through to Pages static assets
    return env.ASSETS.fetch(request);
  }
};
