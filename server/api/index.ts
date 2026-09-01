/**
 * Vercel serverless entry point.
 *
 * Deploy the `server/` folder as its own Vercel project (Root Directory = server).
 * `server/vercel.json` routes every request to this function, and the Express
 * app then handles routing internally (`/api/...`).
 *
 * NOTE: serverless is a compromise for this app — see DEPLOYMENT.md. A always-on
 * host (Railway / Render / Fly / a VPS) is the recommended target for the API.
 */
import { createApp } from '../src/app';

export default createApp();
