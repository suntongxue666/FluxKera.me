import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Disable Turbopack to troubleshoot build issues
    // This might be necessary if Turbopack is causing unexpected errors
    // and preventing proper compilation of styles.
    // If disabling Turbopack resolves the issue, it indicates a compatibility
    // problem between the current Next.js version and Turbopack.
    // Once the project is stable, Turbopack can be re-enabled for faster development.
    // For more details, refer to Next.js documentation on experimental features.
    // https://nextjs.org/docs/advanced-features/turbopack
    // https://nextjs.org/docs/app/building-your-application/configuring/next-config
  },
};

export default nextConfig;