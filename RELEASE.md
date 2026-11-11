# Cartoon scene release · 11 November 2026

Production: https://emreedonmez.com and https://www.emreedonmez.com

Worker: `emreedonmez`

Published Cloudflare version: `c3af8809-db94-4fab-96bc-3732d47aebbc`.

Previous BMO diorama version: `00b1e0f9-fd05-4fab-a09d-44802074a923`.

Original retro console version: `b5e648f8-dd3e-4172-bb04-5150a8062b48`.

Public repository: https://github.com/emreedonmez/emreedonmez-portfolio

## What changed

The client's exact supplied treehouse image fills the browser without surrounding blank space. The diorama, oversized BMO and unrelated page decorations have been replaced. The small seated BMO uses toon shading, thin outlines, real 3D limbs and shallow aligned controls. Existing portfolio content and both domains are retained.

`public/treehouse-room.png` and `dist/treehouse-room.png` were verified byte-for-byte identical to the supplied file. SHA-256: `c257d42b005cef221dbb2a38c082998c0c9e6e73a302a85db61f779127195d04`.

## Verification

- JavaScript syntax, 6 content/geometry/configuration tests, Vite production build and Wrangler dry run passed.
- All 52 named model components have finite geometry. Their individual measurements are documented in `MODEL-REVIEW.md`.
- Seven rendered model angles were inspected: front, left, right, high, low and both steep sides.
- All four physical cross directions, red select, green back, blue sound and triangle room return passed raycast tests.
- Actual button depth is 0.024; protrusion is 0.022. Front planes are aligned; pressed controls return to the shared mount.
- The HTML display matches the projected 3D display during camera movement to within 1 CSS pixel.
- 320×700, 390×844, 1024×768, 1440×810 and 2560×1080 compositions have full background coverage and no opening-character clipping or page overflow.
- Opening BMO height is approximately 21.5% of viewport height at each composition.
- Mobile touch, keyboard, About scrolling, external confirmation cancellation, PDF availability, reduced motion and WebGL fallback passed.
- No application runtime errors were recorded in the navigation/render run.
- Wrangler reported successful deployment on both existing custom domains.

Tests used an isolated headless Chromium profile. The Computer Use safety layer stopped access to the user's existing browser because it could not reliably determine that browser's current URL. Physical-phone testing was not performed.

## Backups and transfer

Before this redesign: `Portfolio-Backups/BMO-before-cartoon-scene-2026-11-11.zip` and Git tag `v1.0.0-bmo`.

`BMO-Portfolio-Wrangler.zip` includes complete editable source, locked dependencies, Wrangler configuration, supplied artwork, original PDF, licenses and ready-built `dist/`. Secrets, node_modules, local browser profiles and runtime state are excluded.

`START_WINDOWS.cmd` starts the local preview. `DEPLOY_WINDOWS.cmd` installs locked dependencies, builds and deploys. If Cloudflare authentication has expired, run `npx wrangler login` first.
