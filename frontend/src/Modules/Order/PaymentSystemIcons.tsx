import React from 'react';
import {FRC} from 'wide-containers';

interface PaymentSystemIconsProps {
    icons: string[];
    className?: string;
    size?: number | string;
}

const PaymentSystemIcons: React.FC<PaymentSystemIconsProps> = ({icons, className = '', size = 28}) => {
    const height = typeof size === 'number' ? `${size}px` : size;
    return (
        <FRC wrap g={1} className={className} mt={0.5}>
            {icons.map((icon, idx) => (
                <img key={idx} src={icon} alt="icon" style={{height}}/>
            ))}
        </FRC>
    );
};

export default PaymentSystemIcons;
