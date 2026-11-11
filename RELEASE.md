# Full 3D room release · 11 November 2026

Production: https://emreedonmez.com and https://www.emreedonmez.com

Worker: `emreedonmez`

Published Cloudflare version: `3cf52e69-45b6-4d22-a81b-657d83f304ab`.

Previous approved BMO / image-background version: `c3af8809-db94-4fab-96bc-3732d47aebbc`, Git tag `v1.1.0-cartoon`.

Public repository: https://github.com/emreedonmez/emreedonmez-portfolio

## Change

The entire treehouse is now actual Three.js geometry. The drawing remains a composition reference only and is not loaded or shipped as a production background. The approved BMO model, layout, materials, face and portfolio files are unchanged.

The room has 278 mesh components: timber, trunks and knots, floor and rug, a curved upholstered chair, clock, opening window, sunset geometry, foreground table, layered book, open cup, gramophone horn and player, radio, headphones, album frames and shelf objects. A custom cel shader, geometry contours and vector wood strokes keep the cartoon style sharp at large resolutions.

Camera approach occurs through the same 3D environment. Subtle fine-pointer camera displacement reveals different near/far parallax. Rendering remains demand-driven.

## Verification

- Eight unit/configuration/layout tests, JavaScript syntax and production build passed.
- All 278 room mesh components have finite geometry. Major furniture and gramophone parts have genuine volume.
- All four viewport corner rays hit room geometry at five responsive compositions.
- Canonical, left, right, high and wireframe room renders were inspected.
- A new 3840 × 2160 WebGL render was captured successfully.
- Near/far parallax was measured independently: couch approximately 4.03 CSS pixels, foreground table approximately 0.61 under the same camera displacement.
- The four approved BMO/portfolio source files match the prior approved source checksums.
- Existing model tests passed: 52 BMO components, seven angles, eight physical control actions, five viewports, mobile touch, reduced motion and WebGL fallback.
- HTML display alignment during camera travel, navigation, external confirmation cancellation and resume PDF checks passed.
- No application or shader errors were recorded in the render test.
- Wrangler reported a successful deployment on both existing custom domains.

Details: `ROOM-REVIEW.md`, `MODEL-REVIEW.md` and `scripts/fixtures/approved-files.json`.

The tests use an isolated headless Chromium profile. Physical-phone frame rate and hardware performance were not measured.

## Backup and transfer

Prior complete source: `Portfolio-Backups/BMO-before-full-3D-room-2026-11-11.zip`.

`BMO-Portfolio-Wrangler.zip` contains the editable project, locked dependencies, Wrangler configuration, tests, licenses, original PDF and ready-built `dist/`. The room reference is included under `references/` for source work only. Credentials, node_modules, local browser profiles and runtime state are excluded.

Use `START_WINDOWS.cmd` for local development and `DEPLOY_WINDOWS.cmd` to build and publish. If authentication has expired, run `npx wrangler login` first.
