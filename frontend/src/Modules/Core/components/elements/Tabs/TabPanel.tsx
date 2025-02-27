// Modules/Core/components/elements/Tabs/TabPanel.tsx
import React, {ReactNode} from 'react';
import {Box} from '@mui/material'; // Assuming you are using Material-UI Box component

interface TabPanelProps {
    children?: ReactNode;
    value: number;
    index: number;
    innerWrapperClassName?: string;

    [key: string]: any;
}

const TabPanel: React.FC<TabPanelProps> = ({children, innerWrapperClassName, value, index, ...other}) => {
    return (
        <div
            className="overflow-y-auto no-scrollbar"
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={0} sx={{height: '100%'}}>
                    {children}
                </Box>
            )}
        </div>
    );
};

export default TabPanel;
