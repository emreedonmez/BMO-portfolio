# Camera and responsive verification · v1.4.0

- Real mouse input crossed 448° without a horizontal clamp at the default orbit.
- Horizontal mouse and keyboard orbits preserved camera height to within 0.000001 world units. Occlusion never triggers lifting.
- Twenty-four default angles and 72 additional high/far, low/far and low/near rendered angles filled all four viewport corners with room geometry. Actual surface collisions may stop motion; target visibility is deliberately not a collision rule.
- Home restored the original view, spherical approach remained attached to the CSS3D screen, and Room restored the explored angle.
- Normal inertia settled; reduced motion removed automatic travel and inertia.
- Native touch sequences passed orbit, pinch, cancellation, article scrolling and orientation changes.
- Twelve furniture feet met the actual floor/rug plane. Surface and close-up checks are described in `ROOM-REVIEW.md` and `scripts/detail-check.mjs`.
- The existing BMO review passed 52 components, eight physical control actions and seven review angles. Approved source checksums remained unchanged.
- No browser application or shader errors were recorded.

## Touch layout matrix

| Viewport | Smallest menu target | WebGL DPR |
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

Model composition checks also covered 320 × 700, 390 × 844, 1024 × 768, 1440 × 810 and 2560 × 1080. An actual 3840 × 2160 render was captured.

## Test scope

The suites use an isolated Chromium profile, software WebGL and touch/viewport emulation. No physical phone was attached. These checks do not measure physical-device frame rate, Safari browser-bar behavior, hardware safe-area insets or physical touch feel.

## Restore

Pre-polish checkpoint: `checkpoint-before-room-polish-v1.3.0` → `5142c8127a875821663df8b68812dcda1e531ddd`.

Cloudflare version: `d0730143-d5a7-4fae-be0d-55a41deb6c20`.

Complete desktop backup: `Portfolio-Backups/BMO-before-room-polish-v1.3.0-2026-11-11.zip`. `RESTORE_BEFORE_ROOM_POLISH.cmd` targets that version. Earlier restore points are retained.
