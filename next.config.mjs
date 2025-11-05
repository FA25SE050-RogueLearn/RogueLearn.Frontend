/** @type {import('next').NextConfig} */
const nextConfig = {
     // ADD THIS LINE
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'html.tailus.io',
        pathname: '/blocks/**',
      },
      {
        protocol: 'https',
        hostname: 'alt.tailus.io',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/u/**',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
