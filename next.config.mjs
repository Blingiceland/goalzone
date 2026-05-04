import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true
  },
  experimental: {
    cpus: 1,
    workerThreads: true
  },
  turbopack: {
    root: __dirname
  }
};

export default nextConfig;
