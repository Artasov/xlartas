// next.config.ts
import type {NextConfig} from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
    eslint: {
        // Disable ESLint checks during production builds to avoid build failures
        // caused by lint errors. Linting can still be run separately in CI or
        // development environments.
        ignoreDuringBuilds: true,
    },
    async rewrites() {
        // В DEV проксируем на Django (localhost:8000).
        // В PROD запросы идут на тот же домен и маршрутизуются через Nginx Proxy Manager,
        // поэтому никаких переписей не делаем.
        if (!isDev) return [];
        return [
            {
                source: "/api/:path*",
                destination: "http://localhost:8000/api/:path*",
            },
            {
                source: "/media/:path*",
                destination: "http://localhost:8000/media/:path*",
            },
            {
                source: "/static/:path*",
                destination: "http://localhost:8000/static/:path*",
            },
            // для ws — используем прямой ws в коде, тут не нужен rewrite
        ];
    },
};

export default nextConfig;
