// Order/OrderStatusItem.tsx
import React from 'react';
import {Typography} from '@mui/material';
import {useTheme} from '@mui/material/styles';

interface StatusItemProps {
    label: string;
    isActive: boolean;
    color: string;
    showNegative: boolean;
}

const OrderStatusItem: React.FC<StatusItemProps> = ({label, isActive, color, showNegative}) => {
    const theme = useTheme();

    return (
        <Typography
            variant="body2"
            component="span"
            sx={{
                color: color,
                textShadow: theme.palette.shadow.XXSO02C, // Убедитесь, что такая тень определена в вашей теме
            }}
        >
            {isActive ? label : (showNegative ? `Не ${label.toLowerCase()}` : null)}
        </Typography>
    );
};

export default OrderStatusItem;
