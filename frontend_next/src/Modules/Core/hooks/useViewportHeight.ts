// Modules/Core/hooks/useViewportHeight.ts
import {useEffect, useState} from 'react';

const useViewportHeight = () => {
    const [viewportHeight, setViewportHeight] = useState(
        typeof window !== 'undefined' ? window.innerHeight : 0,
    );

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            setViewportHeight(window.innerHeight);
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
        };
    }, []);

    return viewportHeight;
};

export default useViewportHeight;

