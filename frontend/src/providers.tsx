"use client";
import React from 'react';
import store from "Redux/store";
import {Provider} from "react-redux";
import {HeaderProvider} from "Core/components/Header/HeaderProvider";
import {AuthProvider} from "Auth/AuthContext";
import {LangProvider} from "Core/LanguageContext";
import {ProfileProvider} from "User/ProfileContext";
import {ErrorProvider} from "Core/components/ErrorProvider";
import {ThemeProvider} from "Theme/ThemeContext";

export default function Providers({children}: {children: React.ReactNode}) {
    return (
        <Provider store={store}>
            <HeaderProvider>
                <AuthProvider>
                    <LangProvider>
                        <ProfileProvider>
                            <ErrorProvider>
                                <ThemeProvider>
                                    {children}
                                </ThemeProvider>
                            </ErrorProvider>
                        </ProfileProvider>
                    </LangProvider>
                </AuthProvider>
            </HeaderProvider>
        </Provider>
    );
}
