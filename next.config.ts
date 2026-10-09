import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingIncludes: {
    "/api/billing/testing-qris": ["./assets/payment/testing-qris.jpg"],
  },
  poweredByHeader: false,
  async redirects() {
    // Alias akun lintas peran harus dialihkan sebelum layout customer memeriksa role.
    return [
      { source: "/dashboard/settings", destination: "/account", permanent: false },
      { source: "/dashboard/settings/profile", destination: "/account", permanent: false },
      {
        source: "/dashboard/settings/security",
        destination: "/account/security",
        permanent: false,
      },
      { source: "/dashboard/account", destination: "/account", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/:path(login|register|forgot-password|reset-password|verify-email)",
        headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
      },
      {
        source: "/account/:path*",
        headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
      },
    ];
  },
};

export default nextConfig;
