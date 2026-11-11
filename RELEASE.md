# Release · 11 November 2026

Production: https://emreedonmez.com and https://www.emreedonmez.com

Worker: `emreedonmez`

Published Cloudflare version: `00b1e0f9-fd05-4fab-a09d-44802074a923`.

Previous Cloudflare version: `b5e648f8-dd3e-4172-bb04-5150a8062b48`.

Repository: https://github.com/emreedonmez/emreedonmez-portfolio (public).

## Verification

- JavaScript syntax checks passed.
- Three content/configuration tests passed.
- Production Vite build and Wrangler dry run passed.
- Isolated Chromium rendering: 1440×1000 and 390×844.
- Room-to-screen camera transition and return passed.
- 3D raycast on yellow cross, red select, green back and blue room button passed.
- About scroll, LinkedIn confirmation cancellation, resume PDF availability passed.
- 320px narrow viewport, reduced motion and WebGL-unavailable fallback passed.
- No application page errors in the render/navigation run.
- Wrangler reported successful upload and deployment on both custom domains.
- Cloudflare API confirms the new active version and both domain bindings.

Screenshots are local test artifacts in `artifacts/`; they are excluded from Git and the production asset directory. Physical phone testing and controlling the user's existing browser were not performed. The Computer Use safety layer stopped that browser interaction because it could not reliably determine the current URL. The automated tests ran in a separate local headless profile, not the existing browser session.

## Transfer

`BMO-Portfolio-Wrangler.zip` contains all editable source, dependency lock file, Wrangler config, licenses, the unmodified provided PDF, the old site under `legacy/`, and ready-built `dist/`.

Use `START_WINDOWS.cmd` to preview. Use `DEPLOY_WINDOWS.cmd` to install locked dependencies, build and deploy to the configured Worker. If Cloudflare login has expired, run `npx wrangler login` first. No credentials are included.
