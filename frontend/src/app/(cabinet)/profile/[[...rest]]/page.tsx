// app/(cabinet)/profile/[...rest]/page.tsx
import type {Metadata} from "next";
import ProfilePageClient from "./ProfilePageClient";

export const metadata: Metadata = {
    title: "XL | Profile",
    description: "User cabinet",
};

export default function ProfilePage() {
    return <ProfilePageClient/>;
}

