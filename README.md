# Hetu × Luoshu

A static, bilingual 3D exploration of the River Map and Luo Writing, with source-based introductions to number relations, cultural history and classical reading.

[Experience the work](https://ensemblism.github.io/hetu-luoshu/) · [Source repository](https://github.com/ensemblism/hetu-luoshu)

## Develop

Use Node 24 (see `.nvmrc`). Run `npm ci`, then `npm run dev`. Open the printed URL at `/hetu-luoshu/`.

- `npm run check`: TypeScript and mathematical/content invariants.
- `npm run build`: generate the canonical static poster and build `dist/`.
- `npm run preview`: inspect the production build.
- `npm run test:e2e`: build and test 3D, references, language, mobile, introduction and SVG fallback.

## GitHub Pages

Choose **GitHub Actions** in repository Settings → Pages. The included workflow deploys `dist/` on `main` updates and supports manual runs. All runtime resources are local static files. Node is only used to build.

The default Vite base is `/hetu-luoshu/`. The deploy workflow derives the actual path from Pages metadata. For a custom-domain root build, set `PAGES_BASE_PATH=/`. There is no pathname router; refreshing language query parameters does not require a server fallback.

## Content and interpretation

The work follows the ten-number Hetu and nine-number Luoshu discussed in *Yixue Qimeng*. It distinguishes classical texts, later scholarship, arithmetic observations and contemporary artistic choices. Small reference marks open authentic bibliographic information on hover, focus or tap.

Geometry, vertical positions, materials and transition trajectories are contemporary design. The transition compares layouts rather than asserting a unique historical derivation. The later nine-palace phase associations are separate from Hetu's generating/completing number associations.

See `docs/content-model.md` for the source register and `docs/visual-direction.md` for rendering conventions. Historical passages are quoted with modern punctuation and explicit ellipses where excerpted. The interface's English explanatory text is the project's own translation, not a quotation from a historical English edition.

## Accessibility and performance

Keyboard-accessible number selection complements direct 3D picking. Canvas arrows orbit, +/− zoom and Home resets. Reduced motion uses manual introduction steps. SVG fallback shares the canonical mathematical data. System fonts avoid external services and large CJK downloads. The renderer stops drawing when idle.
