// Core/components/elements/OptionsMenu.tsx
import React, {MouseEvent, ReactNode, useState} from 'react';
import {IconButton, Menu} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface OptionsMenuProps {
    className?: string;
    iconClassName?: string;
    children: ReactNode;
}

const OptionsMenu: React.FC<OptionsMenuProps> = ({className, iconClassName, children}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClick = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    // Клонирование дочерних элементов и добавление обработчика onClick
    const enhancedChildren = React.Children.map(children, child => {
        if (React.isValidElement(child)) {
            const originalOnClick = child.props.onClick;
            return React.cloneElement(child, {
                // @ts-ignore
                onClick: (event: MouseEvent<HTMLElement>) => {
                    if (originalOnClick) originalOnClick(event);
                    handleClose();
                }
            });
        }
        return child;
    });

    return (
        <div className={className}>
            <IconButton
                className={iconClassName}
                aria-controls="simple-menu"
                aria-haspopup="true"
                onClick={handleClick}
            >
                <MoreVertIcon/>
            </IconButton>
            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {enhancedChildren}
            </Menu>
        </div>
    );
};

export default OptionsMenu;
