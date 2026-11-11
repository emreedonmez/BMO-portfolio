# Full 3D treehouse room

The approved BMO geometry, materials, face, button layout and portfolio content remain byte-for-byte unchanged. Only the environment and camera integration change.

The reference composition is retained: violet timber walls and trunks; lavender floorboards; sunset window and small blue clock at the back left; purple double chair at the center; gramophone, records, radio and headphones on the right; burgundy table, blue cup, olive book and irregular brown rug at the front left. BMO stays small on the open center floor.

## Construction

- A full interior fills the camera frustum. There is no room image, environment billboard, exposed diorama edge or surrounding empty surface.
- Objects sit in world space on the same ground plane as BMO. The original camera and small-character composition calibrate placement against the drawing.
- Rounded, curved and slightly irregular geometry carries the illustration: tapered trunks, curved couch arms, moulded cushions, piping, horn flare and bowed furniture legs.
- A dedicated cel shader supplies restrained shadow/base/highlight bands independent of the approved BMO lighting. Plum outlines and vector hatching create wood grain, knots, seams and surface wear. These details remain sharp at large resolutions.
- The sunset is visible through an actual opening in the wall, with separate sky, sun and cloud geometry behind it. Clock, records and small picture fronts can use locally generated high-resolution vector textures; they are not room backplates.
- Real camera travel replaces background-image scaling. A restrained pointer parallax in room mode reveals object depth without disturbing the arrangement. Reduced motion disables that parallax.

## Verification

Keep the BMO source hashes unchanged. Check room geometry for finite vertices, genuine thickness and placement. Capture the canonical frame, wide and narrow compositions, camera movement, and separate geometry/offset views to prove the room is three-dimensional. Repeat model controls, HTML-screen alignment, mobile touch and WebGL-fallback checks after integration.

The prior version is preserved in Git and the desktop backup `Portfolio-Backups/BMO-before-full-3D-room-2026-11-11.zip`.
