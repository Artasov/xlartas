import React from 'react';
import userAvatarDefault from "../../static/img/icons/user-avatar-default.png";
import PersonIcon from '@mui/icons-material/Person';

const UserAvatar = ({userImage, height, width, className}) => {
    return (
        userImage ? (
            <img src={userImage}
                 style={{height: height, width: width}}
                 className={`${className} user-avatar d-inline-block align-top rounded-5 object-fit-cover`}
                 alt="Аватар пользователя"/>
        ) : (
            <PersonIcon style={{height: height, width: width}} className={`${className}`}/>
        )
    );
}

export default UserAvatar;