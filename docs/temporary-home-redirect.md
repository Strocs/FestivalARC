# Temporary homepage redirect

Vercel redirects only `/` to https://www.instagram.com/festival_arc with HTTP 302 while the production homepage is being prepared. Other paths, including archived editions, remain available. This deployment rule also applies to Vercel preview deployments; local development is unchanged.

When the homepage is ready, remove the `redirects` entry from `vercel.json` and update `scripts/home-redirect.test.mjs` in both main and dev.

Check the configuration with `node --test scripts/home-redirect.test.mjs`. After deployment, verify the response with `curl -I https://festivalarc.com/` (expect HTTP 302 and the Instagram Location header).
