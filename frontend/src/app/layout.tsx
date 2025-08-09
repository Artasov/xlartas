// app/layout.tsx
import type {Metadata, Viewport} from "next";
import {Geist, Geist_Mono, Nunito, Roboto_Mono} from "next/font/google";
import "./globals.css";
import "../Static/css/base.sass";
import "../Static/css/wide-classes.css";
import "../Static/css/ReactToastify.sass";
import "../Static/css/bootstrap_overwrite.sass";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import Providers from "../providers";
import LayoutClient from "./LayoutClient";
import {Suspense} from "react";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const nunito = Nunito({
    variable: "--font-nunito",
    subsets: ["latin", "cyrillic"],
    weight: ["300", "400", "500", "600", "700", "800", "900"],
    display: "swap",
});

const robotoMono = Roboto_Mono({
    variable: "--font-roboto-mono",
    subsets: ["latin"],
    weight: ["300", "400", "500", "700"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "XLARTAS",
    description: "XLARTAS — платформа и продукты XLARTAS",
    applicationName: "XLARTAS",
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_ORIGIN || "http://localhost:3000"),
    openGraph: {
        title: "XLARTAS",
        description: "XLARTAS — платформа и продукты XLARTAS",
        type: "website",
        url: "/",
    },
    twitter: {
        card: "summary_large_image",
        title: "XLARTAS",
        description: "XLARTAS — платформа и продукты XLARTAS",
    },
};

export const viewport: Viewport = {
    themeColor: "#000000",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
};

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html
            lang="ru"
            className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable} ${robotoMono.variable}`}
        >
        <body style={{fontFamily: 'var(--font-nunito)'}}>
        <Suspense fallback={null}>
            <Providers>
                <LayoutClient>{children}</LayoutClient>
            </Providers>
        </Suspense>
        </body>
        </html>
    );
}
