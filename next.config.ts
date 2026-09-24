import type { NextConfig } from "next";
// Import fra "@sentry/nextjs/config" (ikke pakkeroten) — den gamle stien
// fjernes i @sentry/nextjs v11. `disableLogger` er også avviklet (og virker
// ikke med Turbopack), derfor er den fjernet.
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "duties-tony-fioricet-owners.trycloudflare.com",] as string[],
};

export default withSentryConfig(nextConfig, {
  silent: true,
});
