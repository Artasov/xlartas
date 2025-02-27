// Modules/User/Profile.tsx

import React from 'react';
import {NavLink, Route, Routes, useLocation, useNavigate} from 'react-router-dom';
import {useTheme} from "Theme/ThemeContext";
import TabButton from "Core/components/elements/Tabs/TabButton";
import {FC, FRS} from "WideLayout/Layouts";
import UserPersonalInfoForm from "User/UserPersonalInfoForm";

interface ProfileProps {
    selectedProfile: 'client' | 'employee';
}

const Profile: React.FC<ProfileProps> = ({selectedProfile}) => {
    const {theme} = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    // Определяем активные маршруты для вкладок
    const basePath = '/profile';
    const currentPath = location.pathname;

    // Определяем вкладки в зависимости от выбранного профиля
    const tabs = selectedProfile === 'client' ? [
        {label: 'Пользователь', path: `${basePath}/user`},
        // {label: 'Клиент', path: `${basePath}/client`}, // Будет видео профиль клиента
    ] : [
        {label: 'Пользователь', path: `${basePath}/user`},
        {label: 'Сотрудник', path: `${basePath}/employee`},
    ];

    // Если пользователь находится на /profile, перенаправляем на первую вкладку
    React.useEffect(() => {
        if (currentPath === basePath || currentPath === `${basePath}/`) {
            navigate(tabs[0].path);
        }
    }, [currentPath, navigate, tabs]);

    return (
        <FC h={'100%'}>
            <FRS g={2} px={3} pt={2}>
                {tabs.map((tab) => (
                    <NavLink key={tab.path} to={tab.path} style={{textDecoration: 'none'}}>
                        {({isActive}) => (
                            <TabButton fontSize={'1.3rem'} textSx={{padding: '0 .7rem'}} active={isActive}>
                                {tab.label}
                            </TabButton>
                        )}
                    </NavLink>
                ))}
            </FRS>
            <FC flexGrow={1} scroll={'y-auto'} px={3} py={1}>
                <Routes>
                    <Route path="user" element={<UserPersonalInfoForm/>}/>
                </Routes>
            </FC>
        </FC>
    );
};

export default Profile;
