// Must be the very first thing imported by main.ts, before any other
// module (including AppModule), so Sentry can patch Node internals
// before they're used. dotenv.config() is safe to call even if the
// host already injected real env vars (it never overwrites existing
// process.env values) — it just makes SENTRY_DSN available in local dev.
import * as dotenv from 'dotenv';
dotenv.config();

import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV ?? 'development',
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: 0.2,
    profilesSampleRate: 0.2,
  });
}
