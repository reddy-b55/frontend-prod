const withTM = require('next-transpile-modules')([
  '@mui/material',
  '@mui/icons-material',
  '@mui/x-date-pickers',
  '@mui/x-date-pickers-pro'
]);

module.exports = withTM({
  images: {
    domains: [
      'aahaas-prod-assets.s3.ap-southeast-1.amazonaws.com',
      'localhost'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'aahaas-prod-assets.s3.ap-southeast-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // other Next.js config options
});

