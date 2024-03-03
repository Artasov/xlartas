import userAvatarDefault from "../../../../static/base/images/icons/user-avatar-default.png";

const UserAvatar = ({userImage, height, width}) => {
    return (
        <img src={userImage || userAvatarDefault}
             style={{height: height, width: width}}
             className={`${userImage ? '' : 'invert-80'} d-inline-block align-top rounded-5 object-fit-cover`}
             alt="Аватар пользователя"/>
    );
}

export default UserAvatar;