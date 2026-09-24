# ICE AI Site Hosting

Static website repository for the ICE AI website.

## Deployment

This repository is intended to deploy to Cloudflare Pages from the `main` branch.

For a plain HTML/CSS/JavaScript site:

- Framework preset: None
- Production branch: main
- Build command: leave blank
- Build output directory: the repository root (or the folder containing `index.html`)

## Production files

Replace the temporary `index.html` with the real site and add any CSS, JavaScript, images and other assets using the same relative paths used by the HTML.

## Domain

Connect the production domain in Cloudflare Pages under **Custom domains** after the Pages deployment succeeds.
