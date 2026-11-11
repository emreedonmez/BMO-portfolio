# Compact room and surface correction · v1.4.0 · 11 November 2026

Production: https://emreedonmez.com and https://www.emreedonmez.com

Worker: `emreedonmez`

Cloudflare version: `d45f175b-598c-4ad2-a037-8f9b318d4b09`, 100% traffic.

Implementation commit: `8ad8f2c`. Release tag: `v1.4.0-room-polish`.

Public source: https://github.com/emreedonmez/emreedonmez-portfolio

## Result

Horizontal camera movement no longer raises itself over furniture. Actual camera-path sweeps stop direct surface penetration; an object blocking BMO is allowed to occlude it naturally. Orbit, wheel/pinch, Home, spherical approach, explored return and the existing portfolio controls remain available.

The oversized enclosure is replaced by a compact, fully modelled interior. Surface artwork is baked onto its own 3D meshes with mipmapped filtering. The rug hull, floating line layers, separate floor-light polygon and high-frequency noise are removed. Welded outlines, antialiased shade bands, explicit shadow offsets and a tighter depth interval remove the major sources of visual instability.

Trees have 23 true recessed cavities. The clock has physical mounting clearance. Artwork planes, frames and supports are separated. The headset rests on a stand beside the player; radio, frames and player no longer occupy conflicting positions. Book, furniture, walls, trunks and shelf supports meet their intended surfaces.

The approved BMO model, controls and portfolio content are unchanged. Canonical scene draw calls fell from 686 to 398, and triangles from 603538 to 351600. These are workload measurements, not a hardware frame-rate claim.

## Verification

- Thirteen unit tests, syntax, production build and Wrangler dry run passed.
- Real mouse input crossed 448° without a default horizontal clamp.
- Ninety-six camera views passed viewport coverage. Horizontal motion preserved height within 0.000001 world units, including when furniture blocked BMO.
- Thirteen touch layouts passed, including portrait/landscape phones, tablets and wide screens. Orbit, pinch, pointer cancellation, native text scrolling and orientation changes passed.
- All 252 room components are finite. Twelve furniture contacts match their surfaces, all 16 room shadows use explicit placement, and 23 tree openings have true recess geometry.
- Three resting-frame PNGs were byte-identical. Sixteen detailed object views and a fresh 3840 × 2160 render were inspected.
- Existing checks passed 52 BMO components, seven model views, eight physical control actions, screen alignment, content navigation, external confirmation cancellation, resume PDF and WebGL fallback.
- Both production domains, their Worker bindings and the active Cloudflare version were verified after publication.
- No application or shader errors were recorded.

Reports: `DETAIL-REVIEW.md`, `ROOM-REVIEW.md`, `ORBIT-REVIEW.md` and `MODEL-REVIEW.md`. Local captures/measurements stay under ignored `artifacts/`.

Tests use isolated Chromium software WebGL and viewport/touch emulation. No physical phone was attached; physical-device FPS, Safari browser-bar behavior, safe-area hardware and touch feel remain unmeasured.

## Restore and transfer

Previous exact release: `checkpoint-before-room-polish-v1.3.0`, commit `5142c8127a875821663df8b68812dcda1e531ddd`, Cloudflare `d0730143-d5a7-4fae-be0d-55a41deb6c20`.

Complete desktop backup: `Portfolio-Backups/BMO-before-room-polish-v1.3.0-2026-11-11.zip`. `RESTORE_BEFORE_ROOM_POLISH.cmd` targets that deployment. The backup ZIP also permits an independent rebuild and deployment. Older restore points are retained.

Desktop `BMO-Portfolio-Wrangler.zip` contains all editable source, lockfile, deployment configuration, tests, licenses, original PDF and built `dist/`. Tokens, environment files, node_modules, local runtime/browser state, artifacts and Git internals are excluded. The archive is checked for integrity and exact equality with the source/build before delivery.

Use `START_WINDOWS.cmd` locally and `DEPLOY_WINDOWS.cmd` to publish. Run `npx wrangler login` if needed. Existing domain and Worker names stay the same.
