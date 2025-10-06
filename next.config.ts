const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "shots.codepen.io",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
