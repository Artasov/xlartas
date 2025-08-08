// Modules/Core/components/LogsLink.tsx
import React, {useEffect, useState} from 'react';
import {useTheme} from "Theme/ThemeContext";
import SortRoundedIcon from '@mui/icons-material/SortRounded';

const LogsLink: React.FC = () => {
    const {plt} = useTheme();
    const [logsUrl, setLogsUrl] = useState<string>('#');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            if (url.port === '3000') {
                url.port = '8000';
            }
            url.pathname = '/logui/';
            setLogsUrl(url.toString());
        }
    }, []);

    return (
        <a href={logsUrl} target="_blank" rel="noopener noreferrer">
            <SortRoundedIcon
                className={`fs-1 ps-3px`}
                style={{color: plt.text.primary}}
            />
        </a>
    );
};

export default LogsLink;
