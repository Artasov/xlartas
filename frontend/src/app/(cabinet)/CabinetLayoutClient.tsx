// app/(cabinet)/CabinetLayoutClient.tsx
"use client";
import React from 'react';
import Cabinet from "../../Modules/Cabinet/Cabinet";
import {useAuth} from "Auth/AuthContext";

export default function CabinetLayoutClient({
    children,
    initialAuthed = false,
}: { children: React.ReactNode; initialAuthed?: boolean }) {
    const {isAuthenticated} = useAuth();
    const showCabinet = isAuthenticated === null ? initialAuthed : isAuthenticated === true;
    return showCabinet ? <Cabinet>{children}</Cabinet> : <>{children}</>;
}
