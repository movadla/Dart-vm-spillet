import type { NextConfig } from "next";
// Import fra "@sentry/nextjs/config" (ikke pakkeroten) — den gamle stien
// fjernes i @sentry/nextjs v11. `disableLogger` er også avviklet (og virker
// ikke med Turbopack), derfor er den fjernet.
import { withSentryConfig } from "@sentry/nextjs/config";

// Sikkerhetsheadere på alle svar. Ingen CSP ennå (inline-stiler overalt +
// flagcdn/Vercel Analytics gjør en streng CSP til et eget prosjekt — se TODO.md).
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  // Cloudflare-tunnelen (start-dev.ps1) skriver vertsnavnet sitt hit ved hver
  // start — hold denne linjen på ett format, skriptet regex-erstatter den.
  allowedDevOrigins: [
    "duties-tony-fioricet-owners.trycloudflare.com",] as string[],
  async headers() {
    return [{ source: "/(.*)", headers: SECURITY_HEADERS }];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
});
