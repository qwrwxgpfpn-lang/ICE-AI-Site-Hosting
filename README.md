# ICE AI Site Hosting

Production static website for ICE AI.

## Hosting

The site is deployed from the `main` branch to Cloudflare Workers Static Assets.

- Production assets: `public/`
- Worker configuration: `wrangler.jsonc`
- Build command: none
- Deploy command: `npx wrangler deploy`
- Preview command: `npx wrangler preview`

Cloudflare serves the contents of `public/` as the website.

## Domain

The production Worker is attached to `ice-ai.co.uk` using a Cloudflare Custom Domain.

## Updating the site

Commit changes under `public/` to `main`. Cloudflare's Git integration will automatically create a new deployment.
