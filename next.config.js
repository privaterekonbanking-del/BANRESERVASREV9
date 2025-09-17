/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for faster development builds
  swcMinify: true,
  modularizeImports: {
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
  },
  // Redirect root to login
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig