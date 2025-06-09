// Modules/xLMine/SkinCape/SkinCapeView.tsx
import React, {useEffect, useRef, useState} from 'react';
// import ReactSkinview3d from 'react-skinview3d';
// import {FunctionAnimation, SkinViewer} from 'skinview3d';
import CircularProgress from 'Core/components/elements/CircularProgress';

interface SkinCapeViewProps {
    skinUrl?: string | null;
    capeUrl?: string | null;
    width?: number | string;
    height?: number | string;
}

const SkinCapeView: React.FC<SkinCapeViewProps> = ({
                                                       skinUrl,
                                                       capeUrl,
                                                       width = 201,
                                                       height = 360,
                                                   }) => {
    // const viewerRef = useRef<SkinViewer | null>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setLoaded(false);

        const loadImage = (src: string) =>
            new Promise<void>((resolve) => {
                const img = new Image();
                img.onload = img.onerror = () => resolve();
                img.src = src;
            });

        const tasks: Promise<void>[] = [];
        if (skinUrl) tasks.push(loadImage(skinUrl));
        if (capeUrl) tasks.push(loadImage(capeUrl));

        if (tasks.length === 0) {
            setLoaded(true);
            return;
        }

        let cancelled = false;
        Promise.all(tasks).then(() => {
            if (!cancelled) setLoaded(true);
        });

        return () => {
            cancelled = true;
        };
    }, [skinUrl, capeUrl]);

    return (
        <div
            style={{
                position: 'relative',
                width,
                height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
            }}
        >
            {!loaded ? (
                <CircularProgress size="40px"/>
            ) : null}
        </div>
    );
};

export default SkinCapeView;
