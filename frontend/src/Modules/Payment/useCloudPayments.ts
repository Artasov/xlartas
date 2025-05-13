// src/Core/hooks/useCloudPayments.ts
import {useEffect, useState} from 'react';

export const useCloudPayments = () => {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        // @ts-ignore
        if (window.cp?.CloudPayments) {          // уже подключён
            setReady(true);
            return;
        }
        const s = document.createElement('script');
        s.src = 'https://widget.cloudpayments.ru/bundles/cloudpayments.js';
        s.onload = () => setReady(true);
        document.head.appendChild(s);
    }, []);

    return ready;
};
