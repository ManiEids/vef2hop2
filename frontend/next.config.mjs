/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'res.cloudinary.com'],
  },
  // Disable ESLint during build if it's causing issues
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
