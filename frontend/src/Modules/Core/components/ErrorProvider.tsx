// Modules/Core/components/ErrorProvider.tsx
import React, {createContext, ReactNode, useContext, useEffect, useRef} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {AuthContext, AuthContextType} from "Auth/AuthContext";
import pprint from 'Utils/pprint';
import {useNavigation} from "Core/components/Header/HeaderProvider";
import {Message} from "Core/components/Message";
import {openAuthModal} from "Redux/modalsSlice";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "Redux/store";

// Типизация для ErrorContext
export interface ErrorContextType {
    byResponse: (error: any) => void;
    notAuthentication: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const {hideMobileMenu} = useNavigation();
    const {frontendLogout} = useContext(AuthContext) as AuthContextType;
    const dispatch = useDispatch();
    const authModalOpen = useSelector((state: RootState) => state.modals.authModalOpen);
    const isHandlingAuthError = useRef(false);

    useEffect(() => {
        if (!authModalOpen) {
            isHandlingAuthError.current = false;
        }
    }, [authModalOpen]);


    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);

        const errorMessage = searchParams.get('error_message');
        const successMessage = searchParams.get('success_message');

        if (errorMessage) {
            setTimeout(() => {
                Message.error(errorMessage);
            }, 50);  // Задержка в 50ms
            searchParams.delete('error_message');
        }

        if (successMessage) {
            setTimeout(() => {
                Message.success(successMessage);
            }, 50);  // Задержка в 50ms
            searchParams.delete('success_message');
        }

        // Обновляем URL без параметров error_message и success_message
        if (errorMessage || successMessage) {
            navigate(`${location.pathname}?${searchParams.toString()}`, {replace: true});
        }
    }, [location.search, navigate]);

    const notAuthentication = () => {
        if (isHandlingAuthError.current) return;
        isHandlingAuthError.current = true;
        frontendLogout();
        Message.notAuthentication();
        // navigate('/?auth_modal=True');
        dispatch(openAuthModal());
        hideMobileMenu();
    };

    const byResponse = (error: any) => {
        if (!error.response) {
            console.error(error);
            return;
        }
        const response = error.response;
        if (!response.data) {
            pprint(response);
            console.error(error);
            return;
        }
        const data = response.data;
        if (error.response.status && data.code === 'token_not_valid') {
            notAuthentication();
        }
        const detail = data.detail;
        const status = response.status;
        if (
            status === 403 &&
            detail &&
            detail.length &&
            (
                detail.includes('Authentication credentials were not provided') ||
                detail.includes('Given token not valid for any token type') ||
                detail.includes('Учетные данные не были предоставлены') ||
                detail.includes('Данный токен ') ||
                detail.includes('Токен недействителен или просрочен')
            )
        ) notAuthentication();
        else if (status === 401) {
            notAuthentication();
        } else {
            Message.errorsByData(data);
        }

    };

    return (
        <ErrorContext.Provider value={{byResponse, notAuthentication}}>
            {children}
        </ErrorContext.Provider>
    );
};

export const useErrorProcessing = (): ErrorContextType => {
    const context = useContext(ErrorContext);
    if (!context) {
        throw new Error('useErrorProcessing must be used within an ErrorProvider');
    }
    return context;
};
