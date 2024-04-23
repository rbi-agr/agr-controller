import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from "@sentry/profiling-node";

export const SentryConfig = {
    dsn: "https://3ccd3855488e77c9efe924f5228dba89@o4507130085507072.ingest.us.sentry.io/4507130089635840",
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      nodeProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
  }