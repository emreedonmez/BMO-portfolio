# Room surface and detail review · v1.4.0

The reported black rug area was exposed thin back-face outline geometry mixed with floor strokes. The other reported artifacts included near-coplanar artwork, flat knot patches intersecting curved bark, close clock layers and physically overlapping props. Camera jumps came from the explicit sightline-based lift rule.

## Corrections and checks

- Floor, rug, timber, table, book and dial marks are attached to mesh UVs with mipmapped filtering. There are no floating LineSegmentsGeometry surface marks.
- The thin rug has no inverted hull. Solid outlines weld coincident positions before expansion. High-frequency procedural noise is removed and cel-band thresholds are antialiased.
- Sixteen room shadows and BMO's contact shadow share explicit surface offsets and stable ordering, with depth testing, no depth writes and a small depth bias.
- All twelve furniture feet retain exact floor/rug contact. Wall and trunk bases meet the actual floor plane.
- Twenty-three bark openings have genuine removed skin triangles, conforming rims and recessed interiors. Unit raycasts distinguish the cavity from a flat painted disc.
- The clock is mounted on the bark tangent with clearance and painted dial marks. The frame artwork sits in front of its casing. Picture supports, headset stand, player/radio spacing, book contact and shelf braces were corrected.
- The compact interior is 70 × 74 × 28 world units. The camera no longer lifts to keep BMO visible. A swept path stops only direct travel into actual solid triangles.
- Three independently captured resting frames were byte-for-byte identical. A full horizontal circle kept height within 0.000001 world units.

## Inspected views

- rug
- table
- clock-front
- clock-side
- hole-front
- hole-side
- hole-back
- records
- frame-0
- frame-1
- headphones
- radio
- book
- chair
- shelf
- rear

Close-up fixtures can isolate each object for inspection; full-room, 4K and live production checks inspect their integration. Captures and measurements are under ignored `artifacts/`.

Checks used isolated Chromium software WebGL and touch/viewport emulation. Physical-phone frame rate and device-specific rendering were not measured.
