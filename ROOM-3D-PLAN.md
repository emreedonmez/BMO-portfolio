# Full 3D treehouse room

The approved BMO geometry, materials, face, button layout and portfolio content remain unchanged. The changes cover environment navigation, furniture grounding and responsive screen layout.

The reference composition is retained: violet timber walls and trunks; lavender floorboards; sunset window and small blue clock at the back left; purple double chair at the center; gramophone, records, radio and headphones on the right; burgundy table, blue cup, olive book and irregular brown rug at the front left. BMO stays small on the open center floor.

## Construction

- A full interior fills the camera frustum. There is no room image, environment billboard, exposed diorama edge or surrounding empty surface.
- Objects sit in world space on the same ground plane as BMO. The original camera and small-character composition calibrate placement against the drawing.
- Rounded, curved and slightly irregular geometry carries the illustration: tapered trunks, curved couch arms, moulded cushions, piping, horn flare and bowed furniture legs.
- A dedicated cel shader supplies restrained shadow/base/highlight bands independent of the approved BMO lighting. Plum outlines and vector hatching create wood grain, knots, seams and surface wear. These details remain sharp at large resolutions.
- The sunset is visible through an actual opening in the wall, with separate sky, sun and cloud geometry behind it. Clock, records and small picture fronts can use locally generated high-resolution vector textures; they are not room backplates.
- Real camera travel replaces background-image scaling. OrbitControls owns a separate requested camera: drag rotates without horizontal limits, wheel/pinch adjusts distance, and vertical movement remains upright. The rendered camera lifts over furniture without changing the chosen distance. Home restores the original reference composition.
- Rear and side timber walls, a ceiling, rear window, corner trunks, storage chest and books complete the original front composition for 360° viewing. They share the existing cel shader, outlines and wood hatching.
- The chair and both tables have tapered solid legs, inset upper joints, flat feet and soft localized ground contact shadows. Each foot bottom is measured against the actual floor or rug plane.
- Camera approach uses a shortest spherical arc, preserving the CSS3D screen plane. Returning restores the explored orbit. Reduced motion removes automatic camera travel and inertia; deliberate dragging still works.
- On coarse pointers the display uses two columns of large menu targets. Short landscape focuses on the LCD. Only the canvas owns drag/pinch; article text retains native vertical scrolling. Safe areas, dynamic viewport resizing and accessible 44px controls are part of the app shell.

## Verification

Keep the BMO source hashes unchanged. Check room geometry for finite vertices, genuine thickness and placement. Capture the canonical frame, wide and narrow compositions, camera movement, and separate geometry/offset views to prove the room is three-dimensional. Repeat model controls, HTML-screen alignment, mobile touch and WebGL-fallback checks after integration.

The exact approved version before 360° controls is preserved as `checkpoint-before-360-v1.2.0` and the complete desktop backup `Portfolio-Backups/BMO-before-360-v1.2.0-2026-11-11.zip`.
