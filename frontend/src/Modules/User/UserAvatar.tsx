// User/UserAvatar.tsx
import React, {useState} from 'react';
import Avatar from '@mui/material/Avatar';
import PersonIcon from '@mui/icons-material/Person';
import CircularProgress from "Core/components/elements/CircularProgress";

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
            <div onClick={onClick}
                 className={`${className} ratio-1-1 position-relative w-min transition-all transition-d-300 transition-tf-l`}
                 style={avatarStyle}>
                {loading && (
                    <div className="fccc position-absolute top-0 start-0 w-100 h-100"
                         style={{zIndex: zIndex + 1}}>
                        <CircularProgress size={`calc(${size} - 35%)`}/>
                    </div>
                )}
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
            </div>
            :
            <div onClick={onClick}
                 className={`${className} position-relative w-min transition-all transition-d-300 transition-tf-l`}
                 style={avatarStyle}>
                <Avatar
                    className={'transition-all transition-d-300 transition-tf-l'}
                    sx={{
                        overflow: 'hidden',
                        maxWidth: '100%',
                        maxHeight: '100%',
                        width: size,
                        height: sx?.height ? sx.height : size,
                        zIndex: zIndex,
                        position: 'absolute',
                        display: 'flex',
                    }}
                >
                    <PersonIcon
                        className={'transition-all transition-d-300 transition-tf-l'}
                        style={{
                            width: `80%`,
                            height: `80%`
                        }}
                    />
                </Avatar>
                <Avatar
                    className={'transition-all transition-d-300 transition-tf-l'}
                    sx={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        position: 'absolute',
                        width: size,
                        height: sx?.height ? sx.height : size,
                        filter: `blur(${backBlur})`,
                        opacity: '40%',
                        bottom: '0',
                        right: '0',
                        zIndex: zIndex - 1
                    }}
                >
                    <PersonIcon
                        className={'transition-all transition-d-300 transition-tf-l'}
                        style={{
                            width: `80%`,
                            height: `80%`,
                        }}
                    />
                </Avatar>

            </div>
    );
};

export default UserAvatar;
