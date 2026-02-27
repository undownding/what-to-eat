import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // 启用静态导出
  images: {
    unoptimized: true, // 静态导出时需要禁用图像优化
  },
};

export default nextConfig;
