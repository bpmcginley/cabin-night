/* Cabin Night helper Worker (Cloudflare Workers, free plan is plenty).
   Routes:
     GET  /ping                -> {ok:true, ai:boolean}
     GET  /tune?q=...          -> first Deezer search hit with a 30s preview
     POST /questions {spice, tiers, avoid} -> {text} written by Claude (needs ANTHROPIC_API_KEY)
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
        // q: plain search text. a / t (optional): the artist and title we want, used to pick the original
        // recording by the right artist and skip live, remix, karaoke and cover versions.
        const q = (url.searchParams.get('q') || '').slice(0, 200);
        const a = (url.searchParams.get('a') || '').slice(0, 120), want = (url.searchParams.get('t') || '').slice(0, 160);
        if (!q) return json({error: 'Missing q'}, 400);
        const r = await fetch('https://api.deezer.com/search?limit=15&q=' + encodeURIComponent(q));
        const d = await r.json();
        const t = pickTrack(d.data || [], a, want);
        if (!t) return json({found: false});
        return json({found: true, title: t.title, artist: t.artist && t.artist.name, preview: t.preview, cover: t.album && t.album.cover_medium, link: t.link});
      }

      if (url.pathname === '/questions' && req.method === 'POST') {
        if (!env.ANTHROPIC_API_KEY) return json({error: 'Claude questions are not set up on this Worker'}, 501);
        const body = await req.json().catch(() => ({}));
        const spice = String(body.spice || '').replace(/[^\w ,'&-]/g, '').slice(0, 300);
        const tiers = (Array.isArray(body.tiers) ? body.tiers : [1, 2, 3, 4]).map(Number).filter(t => [1, 2, 3, 4].includes(t)).slice(0, 4);
        // avoid: {category: [answers already used]} so Claude writes about new things. Capped to keep the request small.
        const avoid = {}; let budget = 24000;
        for (const c of ['gk', 'mus', 'thr', 'sci', 'his']) {
          const list = Array.isArray(body.avoid && body.avoid[c]) ? body.avoid[c] : [];
          const keep = [];
          for (const a of list) { const v = String(a).replace(/[\n\r;]/g, ' ').slice(0, 40); if (!v || budget - v.length < 0) break; budget -= v.length + 2; keep.push(v); }
          if (keep.length) avoid[c] = keep;
        }
        const r = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': API_VERSION, 'content-type': 'application/json'},
          body: JSON.stringify({model: env.MODEL || 'claude-sonnet-5-5', max_tokens: 16000, messages: [{role: 'user', content: prompt(spice, tiers.length ? tiers : [1, 2, 3, 4], avoid)}]}),
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

const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const ALT_VERSION = /\b(live|remix|karaoke|cover|instrumental|acoustic|demo|edit|version|remaster(ed)?|mix|tribute|made famous|in the style|reprise|8 bit|lullaby|piano|sing ?along|backing track|soundalike|originally performed)\b/;
const COVER_ARTIST = /\b(karaoke|instrumental|tribute|piano|lullaby|8 bit|sing ?along|backing|soundalike|cover|studio|orchestra|romantic|relax|kids|baby|hit crew|players|guitar)\b/;
function pickTrack(data, a, t) {
  if (!t) return data.find(x => x && x.preview) || null;
  const nt = norm(t).replace(/\b(the|a)\b/g, '').trim(), na = norm(a);
  let best = null, bestScore = -1e9;
  data.forEach((x, i) => {
    if (!x || !x.preview) return;
    const xt = norm(x.title), xtc = norm(String(x.title).replace(/\(.*?\)|\[.*?\]|-.*$/g, '')).replace(/\b(the|a)\b/g, '').trim(), xa = norm(x.artist && x.artist.name);
    if (na && !(xa === na || xa.includes(na) || na.includes(xa))) return; // wrong artist: never play a cover
    let s = -i * 0.3;
    if (xtc === nt) s += 6; else if (xtc.startsWith(nt) || nt.startsWith(xtc)) s += 3; else if (xt.includes(nt) || xt.includes(norm(t))) s += 1; else s -= 6;
    if (na) s += 5; else if (COVER_ARTIST.test(xa)) s -= 6;
    if (ALT_VERSION.test(xt) && !ALT_VERSION.test(norm(t))) s -= /remaster/.test(xt) ? 1 : 4;
    if (s > bestScore) { bestScore = s; best = x; }
  });
  return bestScore > -3 ? best : null;
}

function prompt(spice, tiers, avoid) {
  const per = 4, n = 5 * tiers.length * per;
  const names = {1: '1 Easy (most adults know it)', 2: '2 Medium', 3: '3 Hard (an enthusiast would know)', 4: '4 Expert (a deep cut, still fair)'};
  const avoidText = Object.entries(avoid || {}).map(([c, list]) => `${c}: ${list.join('; ')}`).join('\n');
  return `Write fresh trivia for a cozy two-player couples' game night. Return ONLY a JSON array of ${n} objects, no other text.
Categories (field "cat"): "gk" general knowledge (geography, food, sport, film, TV, language, everyday facts), "mus" music (mostly 1970s to today: pop, rock, hip-hop, R&B, country, indie, albums, artists, music videos, award shows; at most one classical or pre-1970 question per tier), "thr" theatre (plays, musicals, Broadway, West End, Shakespeare, stagecraft), "sci" science (physics, chemistry, biology, space, earth science, technology), "his" history (ancient to modern, all regions of the world, inventions, leaders, wars, explorers, everyday life in the past).
Tiers (field "tier"): only ${tiers.map(t => names[t]).join(', ')}.
Write exactly ${per} questions for every category and tier pair (5 categories x ${tiers.length} tiers x ${per} = ${n}).
Each object: {"cat":"his","tier":${tiers[0]},"q":"question text","a":"short answer, 1-4 words","alts":["other accepted spellings or forms"],"wrong":["three plausible wrong answers"]}.
Rules: answers must be factual, unambiguous and not likely to change; no trick wording; questions under 140 characters; the 3 wrong answers must be clearly wrong but believable and the same type as the answer; never use yes/no or true/false questions; vary topics widely and avoid the most overused trivia facts.${spice ? ' This round, lean a little toward: ' + spice + '.' : ''}
${avoidText ? `These players already have questions with the answers below. Do NOT write a question whose answer is any of these, and do not ask about the same fact in different words. Pick different people, places, works and facts:\n${avoidText}` : ''}`;
}
