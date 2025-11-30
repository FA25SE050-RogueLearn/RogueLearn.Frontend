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
      {
        protocol: 'https',
        hostname: 'mmenecibrehzfpvblrrd.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    // Serve Unity compressed assets with correct encodings and content types
    // Support both legacy .br outputs and modern .unityweb outputs.
    return [
      // Brotli-compressed files using legacy .br extension
      {
        source: '/unity/Build/:path*\\.data\\.br',
        headers: [
          { key: 'Content-Type', value: 'application/octet-stream' },
          { key: 'Content-Encoding', value: 'br' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/unity/Build/:path*\\.framework\\.js\\.br',
        headers: [
          { key: 'Content-Type', value: 'application/javascript' },
          { key: 'Content-Encoding', value: 'br' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/unity/Build/:path*\\.wasm\\.br',
        headers: [
          { key: 'Content-Type', value: 'application/wasm' },
          { key: 'Content-Encoding', value: 'br' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Modern UnityWeb file naming (.unityweb) — assumes Brotli compression in Player Settings
      {
        source: '/unity/Build/:path*\\.data\\.unityweb',
        headers: [
          { key: 'Content-Type', value: 'application/octet-stream' },
          { key: 'Content-Encoding', value: 'br' }, // change to 'gzip' if you built with Gzip
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/unity/Build/:path*\\.framework\\.js\\.unityweb',
        headers: [
          { key: 'Content-Type', value: 'application/javascript' },
          { key: 'Content-Encoding', value: 'br' }, // change to 'gzip' if you built with Gzip
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/unity/Build/:path*\\.wasm\\.unityweb',
        headers: [
          { key: 'Content-Type', value: 'application/wasm' },
          { key: 'Content-Encoding', value: 'br' }, // change to 'gzip' if you built with Gzip
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
  async rewrites() {
    // Ensure Unity StreamingAssets are resolved correctly when loader requests at root path
    return [
      {
        source: '/StreamingAssets/:path*',
        destination: '/unity/StreamingAssets/:path*',
      },
    ];
  },
};

export default nextConfig;
