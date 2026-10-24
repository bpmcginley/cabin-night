/* Cabin Night settings. Fill these in once (see README.md). These values are safe to be public. */
window.CN_CONFIG = {
  // From Firebase console > Project settings > Your apps > Web app > Config
  firebase: {
    apiKey: "AIzaSyAs2NlWVPra8F4mCMpqtcmCfuxjeTS_rJ4",
    authDomain: "beaming-mode-436723-v5.firebaseapp.com",
    projectId: "beaming-mode-436723-v5",
    storageBucket: "beaming-mode-436723-v5.firebasestorage.app",
    messagingSenderId: "393696929617",
    appId: "1:393696929617:web:06d3eb68eb8ef7199e1570"
  },
  // Your Cloudflare Worker address, e.g. "https://cabin-night.yourname.workers.dev" (no trailing slash).
  // Leave empty to skip Deezer song clips and Claude-written questions.
  workerUrl: "https://cabin-night.bpmcginley.workers.dev"
};
