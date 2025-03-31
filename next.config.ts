import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "h0m8tgga35.ufs.sh",
        pathname: "/f/*",
      },
    ],
  },
};

export default nextConfig;
