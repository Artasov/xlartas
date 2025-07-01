// Modules/Order/OrderStatusItem.tsx
import React from 'react';
import {Typography} from '@mui/material';
import {useTheme} from "Theme/ThemeContext";

interface StatusItemProps {
    label: string;
    negativeLabel?: string;
    isActive: boolean;
    color: string;
    showNegative: boolean;
}

const OrderStatusItem: React.FC<StatusItemProps> = ({label, negativeLabel, isActive, color, showNegative}) => {
    const {plt} = useTheme();

    return (
        <Typography
            variant="body2"
            component="span"
            sx={{
                color: color,
            }}
        >
            {isActive ? label : (showNegative ? (negativeLabel ?? label) : null)}
        </Typography>
    );
};

export default OrderStatusItem;
