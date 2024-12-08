import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'images.unsplash.com',
      port: '',
      pathname: '/**'
    },{
      protocol: 'https',
      hostname: 'solana.com',
      port: '',
      pathname: '/**'
    },{
      protocol: 'https',
      hostname: 'tether.to',
      port: '',
      pathname: '/**'
    },{
      protocol: 'https',
      hostname: 'assets.coingecko.com',
      port: '',
      pathname: '/**'
    },{
      protocol: 'https',
      hostname: 'gateway.pinata.cloud',
      port: '',
      pathname: '/**'
    }, {
      protocol: 'https',
      hostname: 'seo-heist.s3.amazonaws.com',
      port: '',
      pathname: '/**'
    }, {
      protocol: 'https',
      hostname: 'github.com',
      port: '',
      pathname: '/**'
    }, {
      protocol: 'https',
      hostname: 'ansubkhan.com',
      port: '',
      pathname: '/**'
    }, {
      protocol: 'https',
      hostname: 'utfs.io',
      port: '',
      pathname: '/**'
    }]
  }
};
export default nextConfig;
