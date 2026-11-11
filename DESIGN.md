# BMO · Cartoon scene redesign

## Exact scene reference

The client supplied a 735 × 414 treehouse illustration with violet timber, lavender floorboards, a purple chair, gramophone and foreground table. `public/treehouse-room.png` is an unmodified byte-for-byte copy of that image. It is the full-screen background, rather than a room recreated with primitive 3D furniture.

The art uses `object-fit: cover`, centered, with no page padding or surrounding surface. Other aspect ratios crop the art at its edges instead of stretching it or adding blank bars. The background remains visible during the portfolio camera move.

## Composition and visual system

Opening scene: a small seated BMO on the open floor in front of the chair, near the horizontal center. Its full silhouette occupies approximately 21.5% of viewport height, including limbs. The anchor is mapped through the background's cover crop and clamped to the visible center floor. No oversized heading, identity block, model platform or diorama edges appear outside the scene.

Palette: plum ink `#292133`, room violet from the supplied art, teal shell `#78b9a5`, mint display `#d2f2cc`, yellow cross `#f7d661`, red `#de4568`, blue `#78c1d4`, green `#b3df58`.

The body and limbs use discrete toon shading. The display and button faces use flat fills. Rounded volumes retain actual depth; thin contours make their silhouette consistent with the illustration. No PBR shine, metallic surface, external cast shadow or self-shadow is applied to the character. A painted transparent contact shadow anchors it to the floor.

Interface: the existing Pixel font stays inside the display, with readable monospace body text. Outside the character only small functional controls appear. Desktop keyboard alternatives become visible on focus. Mobile alternatives sit below the character without covering its controls.

## Model plan and individual review

`src/bmo-layout.js` is the shared geometry specification. The shell is 2.65 wide, 3.35 high and 1.14 deep. All five main controls mount at Z = 0.580, have depth 0.024, and press inward by 0.009. Their resting front surface is only 0.022 ahead of the shell. All control object rotations are zero; no cap independently tilts toward the viewer.

The model contains 52 named mesh components, reviewed individually:

- Rounded shell: continuous surface and narrow silhouette contour.
- Screen border and rounded display: matching proportions and shared CSS3D plane.
- Cartridge recess and two small blue bars: surface drawings, no raised ledges.
- Yellow cross, blue triangle, red/green/blue circles: clear spacing, closed contours, aligned mounting planes and real raycast actions.
- Both side labels: tangent to the side panels rather than floating outside them.
- Eighteen speaker holes: three rows per side, no overlap with the front face.
- Two curved arms, palms and twelve finger/tip meshes: continuous attachment and rounded ends.
- Two extended legs and upturned feet: seated pose and contact with the illustrated floor.
- Contact shadow: transparent painted plane, never a shadow receiver crossing the shell.

The visual contour lines are excluded from raycasting. Only physical meshes receive button input; a contour's line-picking tolerance cannot activate an adjacent control.

## Camera and interaction

One transparent Three.js scene overlays the supplied art. Clicking BMO moves the perspective camera from a small three-quarter composition to a front-facing close-up. Position, target and lens offset interpolate together over 1.25 seconds. The background gently enlarges around the same floor anchor. Escape reverses the transition; reduced-motion preference changes views immediately.

The accessible HTML display is a CSS3DObject in the same camera coordinates as the model. Its aspect ratio exactly matches the physical display. Mid-transition automated measurements compare DOM bounds against the projected model corners.

The existing About, Projects, Resume, LinkedIn, GitHub and Contact content is preserved. Camera and scene changes do not replace portfolio information.

## Verification

- Geometry checks: finite bounds for all 52 named mesh components; actual front-face coplanarity, depth, rotations and separation.
- Seven visual angles: front, left, right, high, low and both steep side views.
- Real model raycasts: all four cross directions, red select, green back, blue sound and triangle room return.
- Compositions: 320×700, 390×844, 1024×768, 1440×810 and 2560×1080.
- Original background dimensions, full-viewport coverage, no scrolling or clipped opening character.
- Mouse, mobile touch, keyboard, text scrolling, external confirmation cancellation, resume PDF and WebGL-unavailable fallback.
- No page runtime errors in the navigation/render run.

The Computer Use safety layer cannot verify the URL of the user's existing browser in this session. That UI is left alone. Local software QA uses an isolated headless Chromium profile; it does not connect to that browser.

## History and resources

Previous diorama release retained under Git tag `v1.0.0-bmo`, Cloudflare version `00b1e0f9-fd05-4fab-a09d-44802074a923` and the desktop backup `Portfolio-Backups/BMO-before-cartoon-scene-2026-11-11.zip`.

The supplied BMO frame from the original brief remains the shape, face and control reference. The supplied room image is now the actual background. Three.js geometry and CSS3DRenderer implement the interaction; no third-party model files are copied.
