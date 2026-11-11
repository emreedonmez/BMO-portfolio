# BMO model review — cartoon scene

52 named mesh components checked for finite geometry. Seven rendered review angles were inspected: front, left, right, high, low, side-left and side-right.

Controls: four cross directions, red select, green back, blue sound and triangle room return all passed real raycast tests.

All button front surfaces are coplanar. Actual depth is 0.024; protrusion from the shell is 0.022 (less than 1% of body width). The HTML screen follows its projected model corners during the camera transition to within 1 CSS pixel.

| Component | Geometry | Vertices | Finite |
|---|---|---:|---|
| body | RoundedBoxGeometry | 4356 | Yes |
| screen-border | ShapeGeometry | 100 | Yes |
| face | ShapeGeometry | 100 | Yes |
| cartridge-slot | ShapeGeometry | 100 | Yes |
| small-bar-0 | ShapeGeometry | 100 | Yes |
| small-bar-1 | ShapeGeometry | 100 | Yes |
| dpad | ExtrudeGeometry | 132 | Yes |
| triangle | ExtrudeGeometry | 24 | Yes |
| red | ExtrudeGeometry | 468 | Yes |
| green | ExtrudeGeometry | 468 | Yes |
| blue | ExtrudeGeometry | 468 | Yes |
| side-name--1 | PlaneGeometry | 4 | Yes |
| speaker--1-0-0 | CircleGeometry | 18 | Yes |
| speaker--1-0-1 | CircleGeometry | 18 | Yes |
| speaker--1-0-2 | CircleGeometry | 18 | Yes |
| speaker--1-1-0 | CircleGeometry | 18 | Yes |
| speaker--1-1-1 | CircleGeometry | 18 | Yes |
| speaker--1-1-2 | CircleGeometry | 18 | Yes |
| speaker--1-2-0 | CircleGeometry | 18 | Yes |
| speaker--1-2-1 | CircleGeometry | 18 | Yes |
| speaker--1-2-2 | CircleGeometry | 18 | Yes |
| arm--1 | TubeGeometry | 429 | Yes |
| palm--1 | SphereGeometry | 475 | Yes |
| finger--1-0 | TubeGeometry | 117 | Yes |
| fingertip--1-0 | SphereGeometry | 475 | Yes |
| finger--1-1 | TubeGeometry | 117 | Yes |
| fingertip--1-1 | SphereGeometry | 475 | Yes |
| finger--1-2 | TubeGeometry | 117 | Yes |
| fingertip--1-2 | SphereGeometry | 475 | Yes |
| leg--1 | TubeGeometry | 429 | Yes |
| foot--1 | SphereGeometry | 475 | Yes |
| side-name-1 | PlaneGeometry | 4 | Yes |
| speaker-1-0-0 | CircleGeometry | 18 | Yes |
| speaker-1-0-1 | CircleGeometry | 18 | Yes |
| speaker-1-0-2 | CircleGeometry | 18 | Yes |
| speaker-1-1-0 | CircleGeometry | 18 | Yes |
| speaker-1-1-1 | CircleGeometry | 18 | Yes |
| speaker-1-1-2 | CircleGeometry | 18 | Yes |
| speaker-1-2-0 | CircleGeometry | 18 | Yes |
| speaker-1-2-1 | CircleGeometry | 18 | Yes |
| speaker-1-2-2 | CircleGeometry | 18 | Yes |
| arm-1 | TubeGeometry | 429 | Yes |
| palm-1 | SphereGeometry | 475 | Yes |
| finger-1-0 | TubeGeometry | 117 | Yes |
| fingertip-1-0 | SphereGeometry | 475 | Yes |
| finger-1-1 | TubeGeometry | 117 | Yes |
| fingertip-1-1 | SphereGeometry | 475 | Yes |
| finger-1-2 | TubeGeometry | 117 | Yes |
| fingertip-1-2 | SphereGeometry | 475 | Yes |
| leg-1 | TubeGeometry | 429 | Yes |
| foot-1 | SphereGeometry | 475 | Yes |
| floor-contact-shadow | PlaneGeometry | 4 | Yes |

## Composition checks

| Viewport | Character height / viewport | Environment |
|---|---:|---|
| 320 × 700 | 21.5% | Full 3D room coverage |
| 390 × 844 | 21.5% | Full 3D room coverage |
| 1024 × 768 | 21.5% | Full 3D room coverage |
| 1440 × 810 | 21.5% | Full 3D room coverage |
| 2560 × 1080 | 21.5% | Full 3D room coverage |

No runtime page errors were recorded. Mobile touch, keyboard, text scrolling, confirmation cancellation, resume PDF, reduced motion and WebGL fallback checks passed.

The approved BMO model, layout and portfolio source files were verified unchanged. No room image is loaded. See ROOM-REVIEW.md for the new environment verification.

These checks use an isolated headless browser. The existing user browser could not be controlled because Computer Use could not verify its current URL. No physical-phone testing was performed.
