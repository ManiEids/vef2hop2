/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'res.cloudinary.com'],
  },
  // Disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ensure SWC is used and Babel is not
  swcMinify: true,
  experimental: {
    forceSwcTransforms: true,
  },
};

export default nextConfig;
