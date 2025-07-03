import {useRef} from 'react';

export interface LongPressHandlers {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
    onTouchMove: () => void;
    onTouchCancel: () => void;
}

const useLongPress = (cb: (e: React.TouchEvent) => void, ms = 600): LongPressHandlers => {
    const timer = useRef<NodeJS.Timeout | null>(null);

    const start = (e: React.TouchEvent) => {
        timer.current = setTimeout(() => cb(e), ms);
    };

    const clear = () => {
        if (timer.current) {
            clearTimeout(timer.current);
            timer.current = null;
        }
    };

    return {
        onTouchStart: start,
        onTouchEnd: clear,
        onTouchMove: clear,
        onTouchCancel: clear,
    };
};

export default useLongPress;
