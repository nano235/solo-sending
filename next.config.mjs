/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "assets.coingecko.com",
			},
		],
	},
    async rewrites() {
        return [
          {
            source: '/api/gastracker/:path*',
            destination: 'https://sepolia.beaconcha.in/:path*'
          }
        ]
      }
};

export default nextConfig;
