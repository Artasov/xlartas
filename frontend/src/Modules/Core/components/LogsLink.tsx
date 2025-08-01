// Modules/Core/components/LogsLink.tsx
import React from 'react';
import {Link} from 'Utils/nextRouter';
import {useTheme} from "Theme/ThemeContext";
import SortRoundedIcon from '@mui/icons-material/SortRounded';

const LogsLink: React.FC = () => {
    const {plt} = useTheme();

    // Динамически изменяем порт, если текущий — 3000
    const logsUrl = (() => {
        const url = new URL(window.location.href);
        if (url.port === '3000') {
            url.port = '8000';
        }
        url.pathname = '/logui/';
        return url.toString();
    })();

    return (
        <Link to={logsUrl} target="_blank" rel="noopener noreferrer">
            <SortRoundedIcon
                className={`fs-1 ps-3px`}
                style={{color: plt.text.primary}}
            />
        </Link>
    );
};

export default LogsLink;
