# DemonicScans for Paperback (0.8)

An unofficial source extension for the iOS app **Paperback** which adds demonicscans.org.

## Install to Paperback
1. Open this repo’s GitHub Pages link (after you enable Pages):
   `https://<your-username>.github.io/paperback-demonicscans/`
2. Tap **Add to Paperback** (or copy the `index.min.json` URL and in Paperback go:
   Settings → External Sources → Add Source Repo).

> Repos must match your Paperback version (0.8 repos for 0.8). :contentReference[oaicite:2]{index=2}

## Dev Quickstart
```bash
npm i
npm run build      # compile TS
npm run bundle     # produce pbpack + index.min.json in /bundles
npm run serve      # local test server at http://localhost:8080
