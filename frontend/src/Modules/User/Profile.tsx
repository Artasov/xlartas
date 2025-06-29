// Modules/User/Profile.tsx
import React, {useContext, useEffect} from 'react';
import {Route, Routes, useLocation, useNavigate} from 'react-router-dom';
import {useTheme} from 'Theme/ThemeContext';
import {FC, FRS} from 'wide-containers';
import UserPersonalInfoForm from 'User/UserPersonalInfoForm';
import {Tab, Tabs} from '@mui/material';
import {useDispatch} from "react-redux";
import {AuthContext, AuthContextType} from "Auth/AuthContext";
import {openAuthModal} from 'Redux/modalsSlice';

interface ProfileProps {
    selectedProfile: 'client' | 'employee';
}

const Profile: React.FC<ProfileProps> = ({selectedProfile}) => {
    const {plt} = useTheme();                             // не удаляем ваш контекст
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {isAuthenticated} = useContext(AuthContext) as AuthContextType;

    /* ---------- список вкладок ---------- */
    const basePath = '/profile';
    const tabs = React.useMemo(
        () =>
            selectedProfile === 'client'
                ? [
                    {label: 'Пользователь', path: `${basePath}/user`},
                    // { label: 'Клиент', path: `${basePath}/client` }, // будет видео-профиль клиента
                ]
                : [
                    {label: 'Пользователь', path: `${basePath}/user`},
                    {label: 'Сотрудник', path: `${basePath}/employee`},
                ],
        [selectedProfile],
    );

    useEffect(() => {
        if (location.pathname.startsWith('/profile') &&
            (!localStorage.getItem('access') || isAuthenticated === false)) {
            dispatch(openAuthModal());
        }
    }, [location.pathname, isAuthenticated, dispatch]);

    /* ---------- авто-redirect на первую вкладку ---------- */
    useEffect(() => {
        if (location.pathname === basePath || location.pathname === `${basePath}/`) {
            navigate(tabs[0].path, {replace: true});
        }
    }, [location.pathname, navigate, tabs, basePath]);

    /* ---------- активная вкладка ---------- */
    const activePath =
        tabs.find((t) => location.pathname.startsWith(t.path))?.path ?? false;

    return (
        <FC h="100%">
            {/* Вкладки */}
            <FRS g={2} px={3} pt={1}>
                <Tabs
                    value={activePath}                         // значение-ключ — path
                    onChange={(_, newValue) => navigate(newValue)}
                    textColor="inherit"
                    indicatorColor="primary"
                    sx={{minHeight: 0}}
                >
                    {tabs.map((tab) => (
                        <Tab
                            key={tab.path}
                            value={tab.path}
                            label={tab.label}
                        />
                    ))}
                </Tabs>
            </FRS>

            {/* Контент выбранной вкладки */}
            <FC flexGrow={1} scroll="y-auto" px={2} py={1}>
                <Routes>
                    <Route path="user" element={<UserPersonalInfoForm/>}/>
                    {/* <Route path="client" element={<ClientProfile />} /> */}
                    {/* <Route path="employee" element={<EmployeeProfile />} /> */}
                </Routes>
            </FC>
        </FC>
    );
};

export default Profile;
