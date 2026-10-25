# Cabin Night

A cozy two-player game night for Bruce and Meredith. It has three boards (Territory, a 3D map; Frontier, a head-to-head map where you grow out from your own cabin and raid each other; and Fireside, a mantel of gifts), with trivia (General Knowledge, Music, Theatre, Science, History), Name That Tune, Word Play and Guess Each Other rounds, plus Double Down, lightning rounds and Final Frost. You can play versus or co-op, and there's a daily word puzzle and a rivalry ledger.

**Hosting:** the game is a static site on GitHub Pages.
**Backend:**
- **Firebase** (free Spark plan) handles live sync, sign-in and song-clip uploads.
- **A small Cloudflare Worker** fetches 30-second Deezer song previews and, optionally, Claude-written questions.

Until the backend is set up, the site runs in **practice mode** on one device.

## Files

| Path | What it is |
|---|---|
| `index.html` | The page and all styles |
| `js/config.js` | **Your settings**: Firebase config and Worker URL |
| `js/backend.js` | Firebase and Worker adapter |
| `js/app.js` | Game logic |
| `js/data.js`, `js/bank-extra.js` | Built-in questions, word puzzles, tunes and songs |
| `worker/worker.js` | Cloudflare Worker code (not served by Pages) |
| `firebase/firestore.rules` | Security rules to paste into Firebase |

## Setup (about 20 minutes, once)

### 1. Pick a house key
Choose a secret phrase you'll both type into the game, such as `snowy-cabin-2026`. Use at least 8 letters, numbers or dashes. Spaces become dashes and capitals don't matter.

It keeps your games private. Anyone without it can't reach your data or your Worker.

### 2. Firebase (free Spark plan, no card needed)
1. Go to <https://console.firebase.google.com> → **Add project**. You can turn Analytics off.
2. Turn on sign-in: **Build → Authentication → Get started → Sign-in method → Anonymous → Enable**.
3. Create the database: **Build → Firestore Database → Create database**. Choose production mode and a US location.
   - On the **Rules** tab, paste `firebase/firestore.rules` and click **Publish**.
4. Register the site: **Project settings (gear) → Your apps → Web `</>`**. Register an app called `cabin-night` and copy the `firebaseConfig` values into `js/config.js`.
5. Allow your site to sign in: **Authentication → Settings → Authorized domains → Add domain**: `bpmcginley.github.io`.

The Firebase web config isn't a secret, so committing it to a public repo is fine. The security rules and your house key protect the data.

### 3. Cloudflare Worker (free plan, 100,000 requests a day)
1. Go to <https://dash.cloudflare.com> → **Workers & Pages → Create → Start with Hello World**. Name it `cabin-night` and click **Deploy**.
2. Click **Edit code**, replace everything with `worker/worker.js`, and click **Deploy**.
3. Go to **Settings → Variables and Secrets** and add:
   - `HOUSE_KEY` (Secret): your house key, lowercase with dashes, as the game shows it. **Required.**
   - `ANTHROPIC_API_KEY` (Secret): optional. Turns on fresh Claude-written questions. Create a key at <https://platform.claude.com>.
   - `ALLOWED_ORIGIN` (Text): optional. Set it to `https://bpmcginley.github.io` so only your site can call it.
   - `MODEL` (Text): optional. Defaults to `claude-sonnet-5-5`.
4. Copy the Worker's `https://cabin-night.<you>.workers.dev` address into `workerUrl` in `js/config.js`.

**Cost of Claude questions:** each game asks for 80 new questions (two batches of 40 written at the same time), roughly 10–20 cents with Sonnet at current prices. They are used before the built-in ones, and any that repeat a built-in question or one from an earlier game are thrown out. Without the key, the game uses its 1,000 built-in trivia questions (200 per category), and it remembers which ones you have seen so it picks new ones first.

### 4. GitHub Pages
1. Commit your edited `js/config.js`.
2. In the repo, go to **Settings → Pages → Build and deployment → Deploy from a branch**. Choose `main` and `/ (root)`, then click **Save**.
3. After a minute, the site is live at `https://bpmcginley.github.io/cabin-night/`.
4. Both of you open the site, enter the same house key, and tap your name.

## Song sources
- **Deezer previews:** 30-second clips of real songs, looked up live through the Worker. Clip length shrinks with difficulty: 15, 10, 7 and 5 seconds. Each clip is credited "Preview courtesy of Deezer". Nothing is stored, as Deezer's guidelines require.
- **Music box:** public-domain melodies, played in the browser. Used when the Worker is off, and for about 1 in 4 Name That Tune rounds.
- **Your clips:** upload under *Write a question → Name That Tune*. Clips are saved in Firestore (no Firebase Storage or paid plan needed), so each must be under 700 KB, about 30 seconds of MP3. The first 20 seconds play.

Check Deezer's terms of use yourself before relying on them. Their developer guidelines don't mention games.

## Updating content
- Add trivia to `BANK2` in `js/bank-extra.js`. The format is `[category, tier 1–4, question, answer, [3 wrong answers], [accepted alternates]]`.
- Add songs to `SONGS` as `{a: 'Artist', t: 'Title'}`. For cast recordings, use a search string instead: `{q: 'Popular Wicked', t: 'Popular', s: 'Wicked'}`.
