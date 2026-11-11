# BMO and the full 3D treehouse

## Composition

The client's room drawing guides the arrangement. The violet wooden interior fills the viewport. A sunset window and blue clock sit at the back left, the purple upholstered chair is at the center, and a gramophone with records, radio and headphones sits at the right. A low burgundy table with an olive book and blue cup occupies the left foreground. Small seated BMO stays on the open center floor.

The approved BMO model and portfolio content are unchanged. The same canonical camera and floor anchor keep its opening size at approximately 21.5% of viewport height. `src/bmo-layout.js`, `src/scene.js`, `src/content.js` and `src/portfolio.js` retain their approved content.

## Real 3D construction

`src/room.js` creates the entire environment in world space. There is no background image, environment image or room billboard. The reference PNG is retained only in `references/` and is excluded from the production build.

- Solid timber boards form the back wall, with an actual window opening.
- Sky, sun and clouds exist behind the opening. A warm polygonal light patch lies on the real floor.
- Irregular tapered trunks use custom ring-based BufferGeometry. Knots, hollow dark centers and bark strokes lie on the trunk surfaces.
- The purple chair has curved extruded arms, bulging and tufted back cushions, separate seat cushions, piping, front rolls and bowed legs.
- The gramophone has a custom variable-radius curved horn, hollow bell, rim, rivets, crank, player chassis, opening lid, vinyl grooves and tonearm.
- The right table, radio, headphone band, earcups and album frames are separate solid objects.
- The foreground table has an irregular top, physical edge, bowed legs, a layered book and open cup with rim and handle.
- The irregular rug, wood seams, scratches and small chips are placed on the floor, not in a screen-space picture.
- The blue clock has a cylindrical case, dial, three-dimensional hands and a hanger mounted on the bark surface.

## Rendering style

A dedicated room ShaderMaterial supplies discrete plum shadow, base and highlight bands. It does not alter the approved BMO lighting. Geometry contours and world-space LineSegments2 strokes carry the sketch-like bark, seams and wood grain. These remain sharp at large resolutions.

The palette follows the reference: plum ink `#2c2033`, violet timber `#6c5577`, lavender floor `#b0a2d1`, purple upholstery `#693872`, pink cushions `#bf5198` and burgundy table `#a14461`. There is no glossy PBR finish or exposed diorama edge.

The few illustrated album fronts are local 512px canvas vector drawings on physical frames. The room itself uses geometry and procedural shading rather than a texture of the reference scene.

## Camera and input

The same Three.js perspective camera renders the environment and BMO; the portfolio screen shares its projection through CSS3DRenderer. Clicking BMO travels through the actual room toward the model over 1.25 seconds. Near and far props exhibit different parallax. Fine-pointer room movement adds a restrained camera displacement; reduced motion disables it.

Physical model buttons, mouse/touch screen menus, keyboard controls, confirmations, PDF and fallback text remain available. Rendering is demand-driven; static room frames are not continuously redrawn.

## Verification and delivery

See `ROOM-REVIEW.md` for the complete environment geometry ledger and `MODEL-REVIEW.md` for the approved character. Tests inspect finite geometry, solid prop depths, camera-ray coverage, independent parallax, a true 4K render, alternate viewpoints, all character controls and screen alignment.

Source, Wrangler configuration, ready-built `dist/`, tests and licenses are included in the desktop package. Source stages are saved to the public GitHub repository; both existing custom domains keep their Worker binding.

Previous approved release: Git tag `v1.1.0-cartoon`, Cloudflare version `c3af8809-db94-4fab-96bc-3732d47aebbc`, and desktop backup `Portfolio-Backups/BMO-before-full-3D-room-2026-11-11.zip`.

Implementation references: https://threejs.org/docs/pages/ShaderMaterial.html, https://threejs.org/docs/pages/BufferGeometry.html, https://threejs.org/docs/pages/ExtrudeGeometry.html.
