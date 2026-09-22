import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "duties-tony-fioricet-owners.trycloudflare.com",] as string[],
};

export default withSentryConfig(nextConfig, {
  silent: true,
  disableLogger: true,
});
