module.exports = {
  async redirects() {
    return [
      {
        source: '/_not-found',
        destination: '/404',
        permanent: true,
      },
    ];
  },
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    return config;
  },
};