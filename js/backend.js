/* Firebase + Worker adapter. Gives the game the same small database API it used before:
   db.doc(path) / db.collection(path) with get, set, update (deep merge), delete, onSnapshot,
   where, orderBy, limit, add. Everything lives under houses/<house key>/ in Firestore. */
window.CNBackend = (function(){
  const cfg = window.CN_CONFIG || {};
  const configured = () => !!(cfg.firebase && cfg.firebase.apiKey && !/^PASTE/.test(cfg.firebase.apiKey) && window.firebase);

  function wrapDoc(ref){
    return {
      id: ref.id, path: ref.path,
      get: () => ref.get(),
      set: v => ref.set(v),
      update: v => ref.set(v, {merge: true}),
      delete: () => ref.delete(),
      onSnapshot: (next, err) => ref.onSnapshot(next, err || (()=>{})),
      collection: c => wrapQuery(ref.collection(c), true),
    };
  }
  function wrapQuery(q, isCol){
    const w = {
      where: (f, op, v) => wrapQuery(q.where(f, op, v)),
      orderBy: (f, d) => wrapQuery(q.orderBy(f, d || 'asc')),
      limit: n => wrapQuery(q.limit(n)),
      get: () => q.get(),
      onSnapshot: (next, err) => q.onSnapshot(next, err || (()=>{})),
    };
    if (isCol){ w.path = q.path; w.doc = id => wrapDoc(id ? q.doc(id) : q.doc()); w.add = async v => wrapDoc(await q.add(v)); }
    return w;
  }

  async function init(house){
    if (!configured()) return null;
    if (!firebase.apps.length) firebase.initializeApp(cfg.firebase);
    const auth = firebase.auth();
    if (!auth.currentUser) await auth.signInAnonymously();
    const fs = firebase.firestore();
    try { fs.settings({ignoreUndefinedProperties: true}); } catch(e) {}
    const root = fs.doc('houses/' + house);
    const db = {
      doc: p => { const s = p.split('/'); return wrapDoc(root.collection(s[0]).doc(s.slice(1).join('/'))); },
      collection: p => { const s = p.split('/'); let r = root.collection(s[0]); for (let i = 1; i < s.length; i += 2) r = r.doc(s[i]).collection(s[i+1]); return wrapQuery(r, true); },
    };
    // Song clips live in Firestore itself (free Spark plan, no Firebase Storage needed).
    // One clip per document, so each clip must stay under ~700 KB (Firestore's limit is 1 MiB per document).
    const MAX_CLIP = 720000;
    const assets = {
      maxBytes: MAX_CLIP,
      upload: async (file) => {
        if (file.size > MAX_CLIP) throw {code: 'too_big'};
        const data = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        await db.doc('clips/' + id).set({data, type: file.type || 'audio/mpeg', size: file.size, at: Date.now()});
        return {id, url: 'clip:' + id};
      }
    };
    return {db, uid: auth.currentUser.uid, assets, worker: makeWorker(house)};
  }

  function makeWorker(house){
    const base = (cfg.workerUrl || '').replace(/\/+$/, '');
    if (!base) return null;
    const call = async (path, opts = {}) => {
      const r = await fetch(base + path, {...opts, headers: {'x-house': house, 'content-type': 'application/json', ...(opts.headers || {})}});
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw {code: r.status === 403 ? 'forbidden' : 'worker_error', message: d.error || ('HTTP ' + r.status)};
      return d;
    };
    return {
      // Look up one song's 30-second Deezer preview.
      tune: (q, a, t) => call('/tune?q=' + encodeURIComponent(q) + '&a=' + encodeURIComponent(a || '') + '&t=' + encodeURIComponent(t || '')),
      // Ask Claude (through the Worker) for fresh trivia. Returns the raw text.
      questions: (spice, signal) => call('/questions', {method: 'POST', body: JSON.stringify({spice}), signal}),
      ping: () => call('/ping'),
    };
  }

  return {init, configured};
})();
