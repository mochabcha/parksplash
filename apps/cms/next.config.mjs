/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: false
  },
  outputFileTracingRoot: new URL('../../', import.meta.url).pathname
};

export default nextConfig;
