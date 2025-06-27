// Modules/Core/SettingsTool.tsx
import React, {useCallback, useContext, useEffect, useState} from 'react';
import Modal from "Core/components/elements/Modal/Modal";
import pprint from "Utils/pprint";
import {AuthContext, AuthContextType} from 'Auth/AuthContext';
import {FC, FCCC, FCSC} from "wide-containers";
import {useTheme} from "Theme/ThemeContext";
import CircularProgress from "Core/components/elements/CircularProgress";
import {useApi} from "../Api/useApi";

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
    const {isAuthenticated, user} = useContext(AuthContext) as AuthContextType;
    const {theme} = useTheme();
    const {api} = useApi();
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
        pprint("Fetching backend config...");
        api.get('/api/v1/backend/config/').then(data => setData(data));
    }, [api, isAuthenticated, user]);

    useEffect(() => {
        if (isOpen) {
            // При открытии модалки запрашиваем данные
            fetchConfig().then();
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
                color={'#fffe'} opacity={50}
                rounded={3} fontSize={'.7rem'} letterSpacing={'.1rem'} lineHeight={'.8rem'}
                onClick={openModal} fontWeight={600}
                cls={'pe-1px'}
                py={1}
                style={{
                    writingMode: 'vertical-lr', /* Текст будет вертикальным, справа налево */
                    transform: 'scale(-1)',
                    margin: 'auto',
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
                sxContent={{px: 1}}
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