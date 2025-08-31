// app/(cabinet)/profile/[...rest]/ProfilePageClient.tsx
"use client";
import Profile from "User/Profile";
import {useProfile} from "User/ProfileContext";

export default function ProfilePageClient() {
    const {selectedProfile} = useProfile();
    return <Profile selectedProfile={selectedProfile ? selectedProfile : 'client'}/>;
}

