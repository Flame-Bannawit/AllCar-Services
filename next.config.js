/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ljwtemdxicbswdznedun.supabase.co' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'https', hostname: 'unpkg.com' },
    ],
  },
}

module.exports = nextConfig