"use client";
// Modules/Auth/Social/elements/OAuthButton.tsx
import React, {useEffect} from "react";
import {IconButton} from "@mui/material";
import Zoom from "@mui/material/Zoom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {DOMAIN_URL, DOMAIN_URL_ENCODED} from "Api/axiosConfig";
import {OAuthProvider} from "Auth/Social/types";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {useTheme} from "Theme/ThemeContext";
import pprint from "Utils/pprint";

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

const OAuthButton: React.FC<OAuthButtonProps> = ({
                                                     provider,
                                                     icon,
                                                     clientId,
                                                     redirectUri,
                                                     scope,
                                                     pxIconSize = 40,
                                                     linked = false,
                                                     onClick,
                                                 }) => {
    const currentUrl = typeof window !== "undefined" ? window.location.href : "";
    const nextParam = encodeURIComponent(currentUrl);
    const nextFromUrl =
        typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("next")
            : null;
    const {plt} = useTheme();
    const oauthUrl = `${redirectUri}?response_type=code&client_id=${clientId}&redirect_uri=${DOMAIN_URL_ENCODED}%2Foauth%2F${provider}%2Fcallback%2F&scope=${scope}&state=${nextParam}&next=${nextFromUrl}`;
    const iconStyle = {color: plt.text.primary, height: `${pxIconSize}px`};

    useEffect(() => {
        pprint(`Provider ${provider}`);
        pprint(`redirectUri: ${DOMAIN_URL}/oauth/${provider}/callback/`);
    }, []);

    return (
        <div style={{position: "relative", display: "inline-block"}}>
            {linked ? (
                <IconButton
                    sx={{p: 1}}
                    className="ratio-1-1 hover-scale-10"
                    style={iconStyle}
                    disabled
                >
                    <FontAwesomeIcon icon={icon} className="h-100"/>
                    <Zoom in={linked} timeout={{enter: 700, exit: 100}}>
                        <CheckCircleIcon
                            style={{
                                color: plt.success.main,
                                position: "absolute",
                                bottom: "0.1rem",
                                right: "0.1rem",
                                fontSize: "1rem",
                            }}
                        />
                    </Zoom>
                </IconButton>
            ) : onClick ? (
                <IconButton
                    sx={{p: 1}}
                    className="ratio-1-1"
                    style={iconStyle}
                    onClick={() => onClick(oauthUrl)}
                >
                    <FontAwesomeIcon icon={icon} className="hover-scale-10 h-100"/>
                </IconButton>
            ) : (
                <a href={oauthUrl}>
                    <IconButton sx={{p: 1}} className="ratio-1-1" style={iconStyle}>
                        <FontAwesomeIcon icon={icon} className="hover-scale-10 h-100"/>
                    </IconButton>
                </a>
            )}
        </div>
    );
};

export default OAuthButton;
