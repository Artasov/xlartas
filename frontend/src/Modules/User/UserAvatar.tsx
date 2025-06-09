// Modules/User/UserAvatar.tsx
import React, {useState} from 'react';
import Avatar from '@mui/material/Avatar';
import CircularProgress from "Core/components/elements/CircularProgress";
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import {FC, FCCC} from "wide-containers";
import {useTheme} from "Theme/ThemeContext";

interface UserAvatarProps {
    avatar?: string | null;
    size: string;
    sx?: React.CSSProperties;
    className?: string;
    roundedClassName?: string;
    backBlur?: string;
    zIndex?: number;
    onClick?: () => void;
}

const UserAvatar: React.FC<UserAvatarProps> = (
    {
        avatar,
        size,
        sx,
        className,
        roundedClassName,
        zIndex = 2,
        backBlur = '10px',
        onClick,
    }) => {
    const {plt} = useTheme();
    const [loading, setLoading] = useState<boolean>(true);
    const avatarStyle = {
        width: size,
        height: size,
        ...sx,
    };
    const handleImageLoad = () => {
        setLoading(false);
    };
    const handleImageError = () => {
        setLoading(false); // You might want to handle errors differently
    };

    return (
        avatar && avatar.length > 1
            ?
            <FC cls={`${className} ratio-1-1 ftrans-300-eio`} w={'min-content'}
                pos={'relative'} onClick={onClick} style={avatarStyle}>
                {loading && <FCCC pos={'absolute'} top={0} w={'100%'} h={'100%'} zIndex={zIndex + 1}>
                    <CircularProgress size={`calc(${size} - 35%)`}/>
                </FCCC>}
                <img
                    className={`object-fit-cover ${roundedClassName ? roundedClassName : 'rounded-circle'} transition-all transition-d-300 transition-tf-l`}
                    style={{
                        width: size,
                        height: sx?.height ? sx.height : size,
                        position: 'absolute',
                        zIndex: zIndex
                    }}
                    src={avatar}
                    alt="User Avatar"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                />
                {!loading && (
                    <img
                        className={`object-fit-cover ${roundedClassName ? roundedClassName : 'rounded-circle'} position-absolute transition-all transition-d-300 transition-tf-l`}
                        style={{
                            overflow: 'hidden',
                            fontSize: '16px',
                            width: size,
                            height: sx?.height ? sx.height : size,
                            filter: `blur(${backBlur})`,
                            opacity: '40%',
                            bottom: '0',
                            right: '0',
                            zIndex: zIndex - 1
                        }}
                        src={avatar}
                        alt="User Avatar Background"
                    />
                )}
            </FC>
            :
            <FC onClick={onClick} cls={`${className} ratio-1-1 ftrans-300-eio`}
                w={'min-content'} pos={'relative'} sx={avatarStyle}>
                <Avatar className={'ftrans-300-eio'} sx={{
                    overflow: 'hidden',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: size,
                    height: sx?.height ? sx.height : size,
                    zIndex: zIndex,
                    position: 'absolute',
                    display: 'flex',
                    background: 'transparent',
                }}>
                    <PersonRoundedIcon className={'ftrans-300-eio'} style={{
                        width: `100%`, height: `100%`,
                        color: plt.text.primary
                    }}/>
                </Avatar>
                <Avatar className={'ftrans-300-eio'} sx={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    position: 'absolute',
                    width: size,
                    height: sx?.height ? sx.height : size,
                    filter: `blur(${backBlur})`,
                    opacity: '40%',
                    bottom: '0',
                    right: '0',
                    zIndex: zIndex - 1,
                    background: 'transparent',
                }}>
                    <PersonRoundedIcon className={'ftrans-300-eio'} style={{
                        width: `100%`, height: `100%`,
                        color: plt.text.primary
                    }}/>
                </Avatar>
            </FC>
    );
};

export default UserAvatar;
