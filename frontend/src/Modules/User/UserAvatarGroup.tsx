// Modules/User/UserAvatarGroup.tsx
import React from 'react';
import UserAvatar from "./UserAvatar";
import {IUser} from 'types/core/user';

import {useTheme} from "Theme/ThemeContext";

interface UserAvatarGroupProps {
    users: IUser[];
}

const UserAvatarGroup: React.FC<UserAvatarGroupProps> = (
    {
        users,
    }) => {
    const {plt} = useTheme();

    return (
        users.map((user, index) => (
            <div className={'frsc'} style={{
                gap: `${0.9 + index / 4}rem`,
                marginRight: index === 0 ? `${users.length * 1.2}rem` : 'unset',
                position: index > 0 ? 'absolute' : 'unset',
                top: index > 0 ? '0' : 'unset',
                left: index > 0 ? `${index * 2}rem` : 'unset',
                zIndex: 2 + users.length - index
            }} key={index}>
                <UserAvatar avatar={user.avatar} size={'2.7rem'}
                            zIndex={2 + users.length - index}/>
                {users.length === 1 && (
                    <span style={{
                        color: plt.text.primary,
                    }} className="fs-5">
                                    {`${user.first_name} ${user.last_name}`}
                                </span>
                )}
            </div>
        ))
    );
};

export default UserAvatarGroup;
