import userAvatarDefault from "../../../../static/base/images/icons/user-avatar-default.png";

const UserAvatar = ({userImage, height, width, className}) => {
    return (
        <img src={userImage || userAvatarDefault}
             style={{height: height, width: width}}
             className={`${className} d-inline-block align-top rounded-5 object-fit-cover`}
             alt="Аватар пользователя"/>
    );
}

export default UserAvatar;