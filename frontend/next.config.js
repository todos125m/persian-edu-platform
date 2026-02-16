
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 's3.ir-thr-at1.arvanstorage.ir'],
  },
};

module.exports = nextConfig;
