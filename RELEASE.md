# 360° treehouse release · v1.3.0 · 11 November 2026

Production: https://emreedonmez.com and https://www.emreedonmez.com

Worker: `emreedonmez`

Published Cloudflare version: `d0730143-d5a7-4fae-be0d-55a41deb6c20` (100% traffic).

Implementation commit: `9746d98`. Release tag: `v1.3.0-orbit`.

Public repository: https://github.com/emreedonmez/emreedonmez-portfolio

## Result

Holding and dragging rotates through the full 360° room. Mouse wheel and two-finger pinch control zoom; arrow keys rotate the room and Home restores the original composition. Returning from BMO restores the explored angle. Camera avoidance lifts over furniture while preserving the chosen distance. The screen approach follows a spherical arc, keeping the CSS3D display attached to the model.

Rear and side timber walls, a framed window, ceiling, rear trunks, books and a chest complete the environment in the same cel palette. Original trunks continue into the ceiling so high/far angles expose no cut ends. The approved opening composition and BMO/content source files are preserved.

The chair and both tables have thicker tapered legs, upper joints, flat feet and localized soft contact shadows. All 12 feet meet the actual floor or rug plane.

Mobile refinements include large two-column menu targets, visible alternative controls, a screen-first landscape camera, side controls in short landscape, safe-area spacing, dynamic viewport handling, native article scrolling and a canvas-only touch gesture surface. The initial LCD stays inside the clipped world container so it cannot widen the mobile viewport before the first frame. Coarse-pointer DPR is capped at 1.5; the cel shaders, colors, outlines and antialiasing remain the same.

## Verification

- Eleven unit tests, syntax checks, production build and Wrangler dry run passed.
- Mouse input crossed 597° without a horizontal clamp.
- Ninety-six rendered camera angles covered default, high/far, low/far and low/near views. Camera and target sightline stayed clear, zoom stayed constant and all four viewport corners hit room geometry.
- Thirteen touch viewport layouts passed, from 320 × 568 to 2560 × 1080, including portrait phones, landscape phones, tablets and wide desktops. The smallest tested menu target was 44.11 CSS pixels tall.
- Native input sequences passed one-finger orbit, two-finger zoom, pointer cancellation, article scrolling and orientation changes.
- All 504 room components have finite geometry. Twelve ground-contact errors are below 0.000001 world units.
- All four approved BMO/portfolio source checksums are unchanged. Existing checks passed 52 model components, seven model angles, eight physical control actions, five compositions and readable WebGL fallback.
- Camera/screen alignment, About scrolling, external confirmation cancellation and resume PDF checks passed.
- Canonical, side, high, rear, wireframe and actual 3840 × 2160 renders were inspected.
- No application or shader errors were recorded. Both production domains and the active Cloudflare version were verified after publication.

Reports: `ORBIT-REVIEW.md`, `ROOM-REVIEW.md`, `MODEL-REVIEW.md`. Machine measurements and screenshots remain in ignored `artifacts/`.

These are isolated Chromium software-WebGL and touch/viewport emulation tests. No physical phone was attached; device frame rate, Safari browser-bar behavior, actual safe-area insets and physical touch feel remain unmeasured.

## Restore and transfer

Exact approved previous version: Cloudflare `3cf52e69-45b6-4d22-a81b-657d83f304ab`; Git tag `checkpoint-before-360-v1.2.0`; commit `0e0b8b61038498fae5a6c8aa7a56560dd9a645ee`.

Complete immutable backup: desktop `Portfolio-Backups/BMO-before-360-v1.2.0-2026-11-11.zip`. `RESTORE_BEFORE_360.cmd` targets that deployment. If Cloudflare no longer retains it, unpack the backup separately and run its deploy script.

Desktop `BMO-Portfolio-Wrangler.zip` contains the editable source, lockfile, Wrangler configuration, tests, licenses, original PDF and ready-built `dist/`. Credentials, node_modules, local runtime state, browser profiles and Git internals are excluded. Archive integrity and equality with the source/build are checked before delivery.

Use `START_WINDOWS.cmd` locally and `DEPLOY_WINDOWS.cmd` to publish. Run `npx wrangler login` if authentication is needed. The existing Worker and both domain bindings stay the same.
