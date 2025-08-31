// app/(cabinet)/layout.tsx
import type {Metadata} from 'next';
import {cookies} from 'next/headers';
import CabinetLayoutClient from './CabinetLayoutClient';

export const metadata: Metadata = {
    title: 'Cabinet',
};

export default async function CabinetLayout({children}: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access')?.value;

    // Let the client decide based on context; seed with cookie to avoid flicker
    return (
        <CabinetLayoutClient initialAuthed={Boolean(token)}>
            {children}
        </CabinetLayoutClient>
    );
}
