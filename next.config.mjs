/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Phaser requires canvas — allow it in webpack
    config.externals = config.externals || [];
    return config;
  },
};

export default nextConfig;
