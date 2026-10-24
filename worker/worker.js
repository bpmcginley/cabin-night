/* Cabin Night helper Worker (Cloudflare Workers, free plan is plenty).
   Routes:
     GET  /ping                -> {ok:true, ai:boolean}
     GET  /tune?q=...          -> first Deezer search hit with a 30s preview
     POST /questions {spice}   -> {text} written by Claude (needs ANTHROPIC_API_KEY)
   Secrets (Settings > Variables and Secrets):
     HOUSE_KEY          required: the same house key you both type into the game
     ANTHROPIC_API_KEY  optional: enables Claude-written questions
   Optional plain variables: MODEL (default claude-sonnet-5-5), ALLOWED_ORIGIN (default *) */

const API_VERSION = '2026-10-21';

export default {
  async fetch(req, env) {
    const cors = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Headers': 'content-type, x-house',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Max-Age': '86400',
    };
    const json = (body, status = 200) => new Response(JSON.stringify(body), {status, headers: {...cors, 'content-type': 'application/json'}});
    if (req.method === 'OPTIONS') return new Response(null, {headers: cors});
    if (!env.HOUSE_KEY || (req.headers.get('x-house') || '').toLowerCase() !== String(env.HOUSE_KEY).toLowerCase()) return json({error: 'Wrong house key'}, 403);

    const url = new URL(req.url);
    try {
      if (url.pathname === '/ping') return json({ok: true, ai: !!env.ANTHROPIC_API_KEY});

      if (url.pathname === '/tune') {
        const q = (url.searchParams.get('q') || '').slice(0, 200);
        if (!q) return json({error: 'Missing q'}, 400);
        const r = await fetch('https://api.deezer.com/search?limit=8&q=' + encodeURIComponent(q));
        const d = await r.json();
        const t = (d.data || []).find(x => x && x.preview);
        if (!t) return json({found: false});
        return json({found: true, title: t.title, artist: t.artist && t.artist.name, preview: t.preview, cover: t.album && t.album.cover_medium, link: t.link});
      }

      if (url.pathname === '/questions' && req.method === 'POST') {
        if (!env.ANTHROPIC_API_KEY) return json({error: 'Claude questions are not set up on this Worker'}, 501);
        const body = await req.json().catch(() => ({}));
        const spice = String(body.spice || '').replace(/[^\w ,'&-]/g, '').slice(0, 300);
        const r = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': API_VERSION, 'content-type': 'application/json'},
          body: JSON.stringify({model: env.MODEL || 'claude-sonnet-5-5', max_tokens: 12000, messages: [{role: 'user', content: prompt(spice)}]}),
        });
        const d = await r.json();
        if (!r.ok) return json({error: (d.error && d.error.message) || 'Claude API error'}, 502);
        const text = (d.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
        return json({text});
      }
      return json({error: 'Not found'}, 404);
    } catch (e) {
      return json({error: 'Worker error: ' + (e && e.message)}, 500);
    }
  },
};

function prompt(spice) {
  return `Write fresh trivia for a cozy two-player couples' game night. Return ONLY a JSON array of 48 objects, no other text.
Categories (field "cat"): "gk" general knowledge, "mus" music (any era: pop, rock, classical, jazz, instruments, theory), "thr" theatre (plays, musicals, Broadway, West End, Shakespeare, stagecraft), "sci" science (physics, chemistry, biology, space, earth science).
Tiers (field "tier"): 1 Easy (most adults know it), 2 Medium, 3 Hard (an enthusiast would know), 4 Expert (a deep cut, still fair).
Write exactly 3 questions for every category and tier pair (4 categories x 4 tiers x 3 = 48).
Each object: {"cat":"sci","tier":2,"q":"question text","a":"short answer, 1-4 words","alts":["other accepted spellings or forms"],"wrong":["three plausible wrong answers"]}.
Rules: answers must be factual, unambiguous and not likely to change; no trick wording; questions under 140 characters; the 3 wrong answers must be clearly wrong but believable and the same type as the answer; vary topics widely.${spice ? ' This round, lean a little toward: ' + spice + '.' : ''}`;
}
