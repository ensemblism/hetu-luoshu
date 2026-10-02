# Development

Use Node 24 (`.nvmrc`), then `npm ci` and `npm run dev`. Open the printed URL at `/hetu-luoshu/`. Production is a static Vite build; there is no database, runtime API, pathname router, or server component.

- `npm run check`: TypeScript and domain/content invariants.
- `npm run build`: generate the canonical static poster and build `dist/`.
- `npm run preview`: inspect the production build.
- `npm run test:e2e`: build and test 3D, SVG, relations, sources, languages, mobile, sound and accessibility.

Browser tests use installed Google Chrome on macOS. On Linux, install Chromium with `npx playwright install --with-deps --only-shell chromium`, or set `PLAYWRIGHT_CHANNEL=chrome`. CI uses Chrome preinstalled on the pinned Ubuntu 24.04 runner.

## GitHub Pages

Select **GitHub Actions** in Settings → Pages. The deploy workflow validates the build and browser behavior, uploads `dist/`, and deploys on `main` updates; it also supports manual runs. Node is used only during the build.

Vite's default base is `/hetu-luoshu/`. The workflow derives the actual base path from Pages metadata. Use `PAGES_BASE_PATH=/ npm run build` for a custom-domain root build. Language query parameters refresh without a server fallback. Static audio is imported through Vite, which rewrites its URL to match the build base; public assets use `import.meta.env.BASE_URL`.

## Original soundscape

“Between numbers / 数之间” is a 60-second contemporary composition made for this project. Sparse synthesized plucks and a quiet harmonic bed use a pentatonic selection; these are artistic musical choices. No recorded instrumental performance or historical composition is attributed to it. The composition and circular reverb are reproducible in `scripts/render-soundscape.mjs`.

To regenerate, install ffmpeg locally, then run `node scripts/render-soundscape.mjs`. It writes an ignored WAV master under `.artifacts/` and the committed 96 kbps MP3 asset. ffmpeg is not needed to develop, build or deploy the site. The master peaks at −9.1 dBFS. The interface starts with sound disabled, lazily loads one audio buffer after an explicit request, fades playback, and suspends audio in the background. A saved volume does not authorize playback on a new visit.

## Interaction

Every visit begins with free exploration. Readings and references open on request. Five-phase study separates associations from directed generating/controlling relations; all members of both endpoints are highlighted together. SVG uses the same relationship data. Reduced motion removes spatial transitions and leaves relation stepping manual.
