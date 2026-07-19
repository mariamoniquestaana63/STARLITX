/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vmbfmerckqmqpaulyydi.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtYmZtZXJja3FtcXBhdWx5eWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NjU2MjAsImV4cCI6MjA5MzQ0MTYyMH0.ikw3fGvLq84bBRlyMZBHgDxrpyW9nTXE5QTQE4sA4EE",
  },
  webpack: (config) => {
    config.externals = config.externals || [];
    return config;
  },
};

export default nextConfig;
