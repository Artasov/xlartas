// app/LayoutClient.tsx
"use client";
import React from "react";
import {ToastContainer} from "react-toastify";
import Head from "Core/components/Head";
import Header from "Core/components/Header/Header";
import SettingsTool from "Core/SettingsTool";
import GlobalAuthModal from "Auth/GlobalAuthModal";
import dynamic from "next/dynamic";
const BackgroundFlicker = dynamic(() => import("Core/BackgroundFlicker"), {ssr: false});
import {useTheme} from "Theme/ThemeContext";
import {useNavigation} from "Core/components/Header/HeaderProvider";
import {useSelector} from "react-redux";
import {RootState} from "Redux/store";

export default function LayoutClient({children}: {children: React.ReactNode}) {
    const isHeaderVisible = useSelector((state: RootState) => state.visibility.isHeaderVisible);
    const {plt} = useTheme();
    const {headerNavHeight, mainRef} = useNavigation();
    const isGt1000 = typeof window !== 'undefined' && window.innerWidth > 1000;
    const isBackgroundFlickerEnabled = useSelector((state: RootState) => state.visibility.isBackgroundFlickerEnabled);

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss={false}
                draggable
                pauseOnHover
                theme={plt.mode}
                className={`disable-tap-select`}
            />
            <div
                className={`App h-100 fc disable-tap-select`}
                style={{
                    color: plt.text.primary,
                    backgroundColor: plt.primary.contrastText
                }}
            >
                {isBackgroundFlickerEnabled && (
                    <BackgroundFlicker
                        count={isGt1000 ? 130 : 45}
                        stickThickness={0.3}
                        stickLength={1.5}
                        stickLengthJitter={0.5}
                        baseSize={3.2}
                        sizeJitter={0.8}
                        glowSize={2}
                        glowSizeJitter={0.4}
                        glowFraction={0.4}
                    />
                )}
                <div className="bg-image-wrapper">
                    <img className="bg-image" alt="Background"/>
                </div>
                <Head/>
                <Header/>
                <SettingsTool/>
                <GlobalAuthModal/>
                <main className={`overflow-y-auto no-scrollbar w-100 fc`}
                      ref={mainRef} style={{
                    minHeight: isHeaderVisible ? `calc(100vh - ${headerNavHeight}px)` : '100vh',
                    maxHeight: isHeaderVisible ? `calc(100vh - ${headerNavHeight}px)` : '100vh',
                }}>
                    {children}
                </main>
            </div>
        </>
    );
}
