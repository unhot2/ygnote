import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 홈 디렉토리(C:\Users\unhot)에 있는 다른 프로젝트의 pnpm-lock.yaml 때문에
  // Next.js가 workspace root를 잘못 추론해 빌드가 깨지는 문제를 막기 위해 명시한다.
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {
    root: path.join(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
