/* Cabin Night settings. Fill these in once (see README.md). These values are safe to be public. */
window.CN_CONFIG = {
  // From Firebase console > Project settings > Your apps > Web app > Config
  firebase: {
    apiKey: "PASTE_API_KEY",
    authDomain: "PASTE_PROJECT_ID.firebaseapp.com",
    projectId: "PASTE_PROJECT_ID",
    storageBucket: "PASTE_PROJECT_ID.firebasestorage.app",
    appId: "PASTE_APP_ID"
  },
  // Your Cloudflare Worker address, e.g. "https://cabin-night.yourname.workers.dev" (no trailing slash).
  // Leave empty to skip Deezer song clips and Claude-written questions.
  workerUrl: ""
};
