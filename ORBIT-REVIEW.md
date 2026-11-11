# 360° room and responsive verification · v1.3.0

## Verified behavior

- Real mouse drag crosses 597° without a horizontal clamp. Hover alone leaves the view still. Dragging BMO does not activate its screen.
- Twenty-four default orbit angles and 72 additional rendered angles at high/far, low/far and low/near limits retain full room coverage and a clear camera/target sightline. Requested zoom is preserved during automatic obstacle avoidance.
- Original composition resets exactly with Home. Entering from behind uses a spherical approach; returning restores the explored angle. Normal inertia settles and reduced motion removes automatic travel.
- All 12 flat furniture feet meet the actual floor/rug plane within 0.000001 world units. Solid tapered stems, joints and localized soft shadows replace the floating appearance.
- The room has 504 finite components, including rear/side walls and trunks continued through the ceiling. Actual 4K, alternate views, wireframe and the high/far view were inspected.
- BMO geometry, materials, face, buttons and portfolio source files match the approved version. Its 52 components, seven review angles and eight physical control actions passed existing checks.
- Native touch input sequences exercise one-finger orbit, two-finger pinch, pointer cancellation and native article scrolling. Orientation change keeps the open article.
- Compact menu targets remain at least 44 CSS pixels tall. Coarse pointers receive visible 44px alternative controls; short landscape moves these beside the LCD. Controls do not cover the display.
- Viewport remains edge to edge, initial mobile layout does not widen the page, and browser page zoom is not disabled.
- Screen alignment during camera travel, About scrolling, external confirmation cancellation, resume availability and readable WebGL fallback passed.
- Eleven unit tests, JavaScript syntax and production build passed. Browser suites recorded no application or shader errors.

## Touch viewport matrix

| Viewport | Smallest menu target height | WebGL DPR |
|---|---:|---:|
| 320 × 568 | 46.90px | 1.5 |
| 360 × 800 | 52.77px | 1.5 |
| 390 × 844 | 57.16px | 1.5 |
| 430 × 932 | 63.03px | 1.5 |
| 568 × 320 | 44.11px | 1.5 |
| 844 × 390 | 53.76px | 1 |
| 932 × 430 | 59.28px | 1 |
| 768 × 1024 | 73.51px | 1 |
| 1024 × 768 | 55.14px | 1 |
| 1366 × 768 | 55.14px | 1 |
| 1440 × 900 | 64.61px | 1 |
| 1920 × 1080 | 77.53px | 1 |
| 2560 × 1080 | 77.53px | 1 |

Additional model composition checks: 320 × 700, 390 × 844, 1024 × 768, 1440 × 810 and 2560 × 1080. A 2560 × 1440 viewport with 1.5 device scale produced a fresh 3840 × 2160 render.

## Limits and reproducibility

The tests use an isolated headless Chromium profile, software WebGL and touch/viewport emulation. No physical phone was attached. Hardware frame rate, Safari browser-bar behavior, physical safe-area insets and touch feel remain unmeasured; emulation is not a substitute for those device checks.

Run `npm test`, `npm run check`, then the four scripts documented in README while the local dev server is running. Measurements and screenshots are stored in ignored `artifacts/`.

## Restore point

Git: `checkpoint-before-360-v1.2.0` → `0e0b8b61038498fae5a6c8aa7a56560dd9a645ee`.

Cloudflare: `3cf52e69-45b6-4d22-a81b-657d83f304ab`.

Complete source/build backup: desktop `Portfolio-Backups/BMO-before-360-v1.2.0-2026-11-11.zip`. `RESTORE_BEFORE_360.cmd` targets that Cloudflare version; the ZIP also permits an independent rebuild and redeployment.
