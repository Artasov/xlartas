// Modules/User/ProfileContext.tsx
"use client";
import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {useNavigate} from 'Utils/nextRouter';
import {useAuth} from "Auth/AuthContext";

type ProfileType = 'employee' | 'client' | null;

interface ProfileContextType {
    selectedProfile: ProfileType;
    setProfile: (profile: ProfileType) => void;
    switchProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const {isAuthenticated, user} = useAuth();
    const navigate = useNavigate();
    const [selectedProfile, setSelectedProfile] = useState<ProfileType>(null);

    useEffect(() => {
        if (isAuthenticated && user)
            setSelectedProfile('client');
    }, [isAuthenticated, user, navigate, selectedProfile]);

    const setProfile = (profile: ProfileType) => {
        setSelectedProfile(profile);
        if (profile) localStorage.setItem('selectedProfile', profile);
    };

    const switchProfile = () => {
        if (selectedProfile === 'employee') setProfile('client');
        else if (selectedProfile === 'client') setProfile('employee');
    };

    return (
        <ProfileContext.Provider value={{
            selectedProfile,
            setProfile,
            switchProfile,
            // setOrders,
        }}>
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = (): ProfileContextType => {
    const context = useContext(ProfileContext);
    if (!context) throw new Error('useProfile must be used within a ProfileProvider');
    return context;
};
