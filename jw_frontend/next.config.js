/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Allow wasm files to be imported
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Polyfill for WebAssembly.instantiateStreaming
    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/async",
    });

    // Resolve the fhenixjs WASM import issue
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    return config;
  },
};

module.exports = nextConfig;
