// Modules/Core/components/BackButton.tsx

import React from 'react';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import {FRSC} from "wide-containers";
import {useNavigate} from "Utils/nextRouter";

interface BackButtonProps {
    iconFontSize?: "inherit" | "small" | "medium" | "large";
    textCls?: string;
    text?: string;
    onClick?: () => void;
}

const BackButton: React.FC<BackButtonProps> = (
    {
        iconFontSize = 'small',
        textCls = '',
        text = 'Назад',
        onClick
    }) => {
    const navigate = useNavigate();
    const backToPreviousPage = () => navigate(-1);
    return (
        <FRSC onClick={onClick ? onClick : backToPreviousPage}>
            <ArrowBackIosNewRoundedIcon fontSize={iconFontSize}/>
            <span className={textCls}>
                {text}
            </span>
        </FRSC>
    );
};

export default BackButton;
