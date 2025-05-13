// src/hooks/useCloudPayments.ts
import {useEffect, useState} from 'react';

export function useCloudPayments(src = 'https://widget.cloudpayments.ru/bundles/cloudpayments.js') {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if ((window as any).cp?.CloudPayments) {
            setReady(true);
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => setReady(true);
        document.head.appendChild(script);
        return () => {
            // если захотите, можно убрать скрипт:
            // document.head.removeChild(script);
        };
    }, [src]);

    return ready;
}
