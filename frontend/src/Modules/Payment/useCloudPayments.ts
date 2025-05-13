import {useEffect, useState} from "react";

export const useCloudPayments = () => {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if ((window as any).cp?.CloudPayments) {
            console.log("[CP] already on page");
            setReady(true);
            return;
        }
        const s = document.createElement('script');
        s.src = 'https://widget.cloudpayments.ru/bundles/cloudpayments.js';
        s.onload = () => {
            console.log("[CP] script loaded, cp =", (window as any).cp);
            setReady(true);
        };
        s.onerror = () => console.error("[CP] failed to load script");
        document.head.appendChild(s);
    }, []);

    return ready;
};