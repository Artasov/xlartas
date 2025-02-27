// Modules/Auth/Social/elements/OAuthButton.tsx
import React from "react";
import { IconButton } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DOMAIN_URL_ENCODED } from "../../../Api/axiosConfig";
import { OAuthProvider } from "Auth/Social/types";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTheme } from "Theme/ThemeContext";

interface OAuthButtonProps {
    provider: OAuthProvider;
    icon: any;
    clientId: string;
    redirectUri: string;
    scope: string;
    pxIconSize?: number;
    linked?: boolean;
    onClick?: (oauthUrl: string) => void;
}

const OAuthButton: React.FC<OAuthButtonProps> = (
    {
        provider,
        icon,
        clientId,
        redirectUri,
        scope,
        pxIconSize = 50,
        linked = false,
        onClick
    }) => {
    const currentUrl = window.location.href;
    const nextParam = encodeURIComponent(currentUrl);
    const nextFromUrl = new URLSearchParams(window.location.search).get('next');
    const { theme } = useTheme();
    const oauthUrl = `${redirectUri}?response_type=code&client_id=${clientId}&redirect_uri=${DOMAIN_URL_ENCODED}%2Foauth%2F${provider}%2Fcallback%2F&scope=${scope}&state=${nextParam}&next=${nextFromUrl}`;
    const iconStyle = { color: theme.palette.text.primary80, height: `${pxIconSize}px` };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            {linked ? (
                <IconButton className="ratio-1-1" style={iconStyle} disabled>
                    <FontAwesomeIcon icon={icon} className="h-100" />
                    <CheckCircleIcon style={{
                        color: theme.palette.success.main,
                        position: 'absolute',
                        bottom: '0.1rem',
                        right: '0.1rem',
                        fontSize: '1rem'
                    }} />
                </IconButton>
            ) : onClick ? (
                <IconButton className="ratio-1-1" style={iconStyle} onClick={() => onClick(oauthUrl)}>
                    <FontAwesomeIcon icon={icon} className="hover-scale-5 h-100" />
                </IconButton>
            ) : (
                <a href={oauthUrl}>
                    <IconButton className="ratio-1-1" style={iconStyle}>
                        <FontAwesomeIcon icon={icon} className="hover-scale-5 h-100" />
                    </IconButton>
                </a>
            )}
        </div>
    );
};

export default OAuthButton;
