// Modules/Landing/LandButton.tsx

import React from 'react';
import {Button, ButtonProps} from '@mui/material';
import {keyframes, styled} from '@mui/material/styles';

// Определяем ключевые кадры для анимации блика
const shineAnimation = keyframes`
    0% {
        left: -110%;
    }
    100% {
        left: 110%;
    }
`;

// Стилизация кнопки с добавлением анимации блика
const StyledButton = styled(Button)(({theme}) => ({
    position: 'relative',
    overflow: 'hidden',
    // Дополнительные стили для кнопки
    padding: theme.spacing(1, 3),
    borderRadius: theme.shape.borderRadius,
    //@ts-ignore
    backgroundColor: theme.colors.primary.main,
    color: '#fff',
    textTransform: 'none',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    cursor: 'pointer',

    // Изменение цвета при наведении
    '&:hover': {
        transform: 'scale(1.03)'
    },

    // Псевдоэлемент для блика
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '40%',
        height: '100%',
        background: 'rgba(255, 255, 255, 0.3)',
        transform: 'skewX(-20deg)',
        filter: 'blur(12px)',
        animation: `${shineAnimation} 2.6s infinite`,
    },
}));

// Интерфейс для пропсов компонента, расширяющий стандартные ButtonProps
interface LandButtonProps extends ButtonProps {
    // Можно добавить дополнительные пропсы, если необходимо
}

// Компонент LandButton
const LandButton: React.FC<LandButtonProps> = ({children, ...props}) => {
    return <StyledButton {...props}>{children}</StyledButton>;
};

export default LandButton;
