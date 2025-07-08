import React from 'react';
import {FR} from 'wide-containers';

interface PaymentSystemIconsProps {
    icons: string[];
    className?: string;
    size?: number | string;
}

const PaymentSystemIcons: React.FC<PaymentSystemIconsProps> = ({icons, className = '', size = 28}) => {
    const height = typeof size === 'number' ? `${size}px` : size;
    return (
        <FR wrap g={0.4} className={className} mt={0.5}>
            {icons.map((icon, idx) => (
                <img key={idx} src={icon} alt="icon" style={{height}}/>
            ))}
        </FR>
    );
};

export default PaymentSystemIcons;
