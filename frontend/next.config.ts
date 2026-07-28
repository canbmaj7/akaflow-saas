import type { NextConfig } from "next";

function backendUrl() {
  const url =
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8000";
  return url.replace(/\/$/, "");
}

const nextConfig: NextConfig = {
  output: "standalone",
  // HTTPS panel → HTTP backend: tarayıcı mixed-content engelini aşmak için
  // istekler aynı origin'den gider, sunucu tarafında backend'e rewrite edilir.
  async rewrites() {
    const base = backendUrl();
    return [
      {
        source: "/api/v1/:path*",
        destination: `${base}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
