import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'images.unsplash.com',
      'cdn.pixabay.com',
      'images.pexels.com',
      'avencrm-bucket.s3.ap-south-1.amazonaws.com',
      'img.freepik.com',
      'www.pngarts.com',
    ],
  },
};

export default nextConfig;
