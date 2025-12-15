// next.config.ts
import type {NextConfig} from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
    turbopack: {
        // Явно фиксируем root, чтобы Turbopack не подхватывал lockfile из корня репозитория.
        root: process.cwd(),
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
