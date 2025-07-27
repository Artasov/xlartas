// Modules/Core/components/elements/OptionsMenu.tsx
import React, {MouseEvent, ReactNode, useState} from 'react';
import {IconButton, Menu} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface OptionsMenuProps {
    className?: string;
    iconClassName?: string;
    icon?: ReactNode;                 // кастом-иконка (глобус)
    children: ReactNode;              // MenuItem-ы
}

/** Вспом-интерфейс: любой элемент, у которого МОЖЕТ быть onClick */
type ClickableElProps = { onClick?: (e: MouseEvent<HTMLElement>) => void };

const OptionsMenu: React.FC<OptionsMenuProps> = ({
                                                     className,
                                                     iconClassName,
                                                     icon,
                                                     children,
                                                 }) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const handleOpen = (e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);

    /* добавляем auto-close к каждому дочернему пункту */
    const enhanced = React.Children.map(children, child => {
        if (!React.isValidElement(child)) return child;

        const origClick = (child.props as ClickableElProps).onClick;
        return React.cloneElement(child as React.ReactElement<ClickableElProps>, {
            onClick: (e: MouseEvent<HTMLElement>) => {
                origClick?.(e);
                handleClose();
            },
        });
    });

    return (
        <div className={className}>
            <IconButton
                className={iconClassName}
                aria-haspopup="true"
                onClick={handleOpen}
            >
                {icon ?? <MoreVertIcon/>}
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                keepMounted
                sx={{'& .MuiPaper-root': {backdropFilter: 'blur(10px)'}}}
                slotProps={{backdrop: {sx: {backdropFilter: 'none !important'}}}}
            >
                {enhanced}
            </Menu>
        </div>
    );
};

export default OptionsMenu;
