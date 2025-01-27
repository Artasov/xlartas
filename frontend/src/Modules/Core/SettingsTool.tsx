// Core/SettingsTool.tsx
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {axios} from 'Auth/axiosConfig';
import {useErrorProcessing} from 'Core/components/ErrorProvider';
import Modal from "Core/components/elements/Modal/Modal";
import pprint from "Utils/pprint";
import {AuthContext, AuthContextType} from 'Auth/AuthContext';
import {FC, FCCC, FCSC} from "WideLayout/Layouts";
import {useTheme} from "Theme/ThemeContext";
import CircularProgress from "Core/components/elements/CircularProgress";

interface BackendConfigResponse {
    config: {
        [key: string]: any;
    };
    server_info: {
        [key: string]: any;
    }
}

const SettingsTool: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [data, setData] = useState<BackendConfigResponse | null>(null);
    const {byResponse} = useErrorProcessing();
    const {isAuthenticated, user} = useContext(AuthContext) as AuthContextType;
    const {theme} = useTheme();
    const openModal = useCallback(() => {
        setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
    }, []);

    const fetchConfig = useCallback(async () => {
        if (!isAuthenticated || !user?.is_staff) {
            pprint("Not authenticated or not admin, cannot fetch config.");
            return;
        }
        try {
            pprint("Fetching backend config...");
            const response = await axios.get('/api/v1/backend/config/');
            pprint("Config data received:");
            pprint(response.data);
            setData(response.data);
        } catch (error) {
            byResponse(error);
        }
    }, [byResponse, isAuthenticated, user]);

    useEffect(() => {
        if (isOpen) {
            // При открытии модалки запрашиваем данные
            fetchConfig();
        }
    }, [isOpen, fetchConfig]);

    if (!isAuthenticated || !user?.is_staff) return '';
    return (
        <FCCC
            zIndex={200}
            cls={'w-100vw h-100vh'}
            pos={'fixed'}
            top={0} left={0}
            pEvents={false}>
            <FCCC
                bg={theme.colors.secondary.main}
                color={'#fffe'}
                rounded={3}
                onClick={openModal}
                cls={'pe-4px ps-3px'}
                py={2}
                style={{
                    writingMode: 'vertical-lr', /* Текст будет вертикальным, справа налево */
                    transform: 'scale(-1)',
                    margin: 'auto',
                    lineHeight: '1rem',
                    pointerEvents: "all",
                    zIndex: 200,
                    position: 'absolute',
                    top: '20%',
                    right: '0',
                }}
            >
                SETTINGS
            </FCCC>

            <Modal
                isOpen={isOpen}
                onClose={closeModal}
                title="Конфигурация"
                cls="w-100 maxw-500px"
                titleCls="fs-3 fw-bold"
                closeBtn={true}
                closeOnOutsideClick={false}
                modalScrollCls="px-2 py-2"
                zIndex={201}
                animDuration={200}
            >
                {data ? (
                    <FCSC pEvents={true} cls={'no-scrollbar'}
                          scroll={'y-auto'} g={2}>
                        <FC g={1} w={'100%'}>
                            <pre className={'no-scrollbar'}
                                 style={{width: '100%', overflow: 'auto', maxHeight: '300px'}}>
                                {JSON.stringify(data.config, null, 2)}
                            </pre>
                            <pre className={'no-scrollbar'}
                                 style={{width: '100%', overflow: 'auto', maxHeight: '300px'}}>
                                {JSON.stringify(data.server_info, null, 2)}
                            </pre>
                        </FC>
                    </FCSC>
                ) : (
                    <FCCC>
                        <CircularProgress size={'120px'}/>
                    </FCCC>
                )}
            </Modal>
        </FCCC>
    );
};

export default SettingsTool;