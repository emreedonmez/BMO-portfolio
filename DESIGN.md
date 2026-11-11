# BMO / Emre Dönmez portfolio

## Brief and content
A full-screen interactive 3D personal portfolio. BMO retains the character's teal rounded box, mint display, black face, side lettering and speaker holes, yellow cross, blue triangle, red and green circular buttons, arms and seated legs. The supplied frame is the primary character reference. No invented work or placeholder copy.

## Composition
A compact cutaway treehouse room fills the viewport. Warm timber planks, round landscape window, exposed beams, a small upholstered sofa, books, plant, lamp and a woven circular rug form a quiet lived-in setting. BMO is the central subject, seated on the floor, with legs extending toward the camera. Room props remain secondary. Warm wood and cream contrast with BMO's teal, yellow and red.

Room camera: perspective three-quarter view, targeting BMO. Portfolio camera: front-facing, close enough to read the LCD while retaining actual model controls. A single scene and model survive the transition. Camera position and target interpolate together over 1.25 seconds; reduced motion changes state immediately. Escape reverses the camera at the menu. No continuous camera drift.

## Implementation decisions
Three.js with procedural geometry, RoundedBoxGeometry, outlined curves and canvas textures. CSS3DRenderer anchors the accessible HTML portfolio to the actual screen plane. The display face uses a local canvas texture in room mode. Screen menus and raycast model buttons share one state/action function. No model download or external runtime/CDN dependency. The browser loads the complete scene locally bundled by Vite.

Sections: About, Projects, Resume, LinkedIn, GitHub, Contact. About retains the existing English introduction. Projects describes the real İpucum project present in the supplied CV. Resume uses the supplied PDF and extracted education, skills and certifications. External links retain their confirmations. Email remains mail@emreedonmez.com. No analytics or forms.

Controls: mouse/touch on BMO opens; actual yellow cross navigates, red circle selects, green circle returns, blue triangle returns to room. Equivalent accessible HTML controls and keyboard arrows/Enter/Escape work. Mobile uses a closer room composition and a screen-first portfolio framing; on-screen control alternatives remain available. Scrollable text is keyboard and touch accessible. Local synthesized sounds are optional. No downloaded copyrighted audio.

## Delivery
Desktop project with npm scripts for development/build/deploy, locked dependencies and Wrangler static-assets configuration. Same Worker and both existing custom domains. Prior local project ZIP, live static files and Cloudflare deployment version archived separately. Public GitHub repo includes the original site under legacy/ and staged commits for design, scene, interaction and deployment. No tokens or account/session files enter Git or the deployment ZIP.

## Verification at completion
Syntax/build, actual section navigation, model button actions, camera entry/exit, external confirmation cancel, PDF link, mobile layout, WebGL failure fallback and reduced motion. Deploy only after build succeeds. Confirm Cloudflare returns a successful deployment and verify served production assets. Existing browser UI automation is unavailable because its safety layer could not verify the open browser URL; do not work around that restriction through another UI driver.

## Research
- Supplied character frame: primary shape, proportions and control arrangement.
- https://sketchfab.com/3d-models/bmo-adventure-time-26033cc012124739a5a8acd6bc96b71f — examined model listing; not downloaded.
- https://sketchfab.com/3d-models/bmo-from-adventure-time-f8505fec4620480ab15f2f49c08d74ff — alternative model reference.
- https://sketchfab.com/3d-models/bmo-adventure-time-ffeb3e9ab97e4e3dbed4ddc0650d8b9b — alternative proportions reference.
- https://github.com/MedTahiri/BMO — procedural modeling approach reference, no code/assets copied.
- https://www.flickr.com/photos/84568447@N00/3100870822 — Fred Seibert / Ghostshrimp production background, room reference only.
- https://www.behance.net/gallery/40330989/Exploring-Land-of-Ooo-Inside-the-Tree-Fort — spatial research only.
- https://threejs.org/docs/pages/RoundedBoxGeometry.html and CSS3DRenderer documentation — implementation.
- https://developers.cloudflare.com/workers/static-assets/binding/ and configuration/routing/custom-domains/ — deployment.

The client supplied exact character, scene, palette and interactions override generic landing-page template/dealing rules in the design skill. The result is a navigable 3D scene rather than a conventional marketing page.
