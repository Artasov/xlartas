// Modules/xLMine/Privilege/UserPrivilege.tsx
import React, {useEffect, useState} from 'react';
import {useApi} from 'Api/useApi';
import {FC, FR, FRCC} from 'wide-containers';
import CircularProgressZoomify from 'Core/components/elements/CircularProgressZoomify';
import {Message} from 'Core/components/Message';
import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';
import {IPrivilege} from '../types/base';
import {useTranslation} from 'react-i18next';

const UserPrivilege: React.FC = () => {
    const {api} = useApi();
    const [privilege, setPrivilege] = useState<IPrivilege | null | undefined>(undefined);
    const {t} = useTranslation();

    /** превращаем "&#RRGGBBХ"-строку в набор span-ов */
    const renderGradient = (str: string) => {
        const result: React.ReactNode[] = [];
        let i = 0;

        while (i < str.length) {
            if (str.startsWith('&#', i) && str.length >= i + 9) {
                const hex = str.slice(i + 2, i + 8);
                const char = str[i + 8];
                result.push(
                    <span key={i} style={{color: `#${hex}`}}>
                        {char}
                    </span>
                );
                i += 9;
            } else {
                result.push(<span key={i}>{str[i]}</span>);
                i += 1;
            }
        }
        return result;
    };

    useEffect(() => {
        api.get('/api/v1/xlmine/privilege/current/')
            .then(data => setPrivilege(data.privilege))
            .catch(() => {
                Message.error(t('privilege_load_error'));
                setPrivilege(null);
            });
    }, [api]);

    // Показываем индикатор загрузки, пока привилегия не получена
    if (privilege === undefined) {
        return (
            <FRCC pos="relative" h="100%" w="50px">
                <CircularProgressZoomify in size={22} h="100%"/>
            </FRCC>
        );
    }

    // Если привилегии нет — ничего не рендерим
    if (!privilege) return null;

    // Плавное появление привилегии после загрузки
    return (
        <Zoom
            in
            appear
            mountOnEnter
            unmountOnExit
            timeout={{enter: 1500, exit: 200}}
        >
            <FC g={1} color={privilege.color || '#aa00aa'} height="100%">
                <Tooltip title={privilege.description || ''}>
                    <FR>
                        <FR>{renderGradient(privilege.prefix || '')}</FR>
                        <FR pos={'absolute'}
                            sx={{filter: 'blur(10px) contrast(2) brightness(2)'}}>
                            {renderGradient(privilege.prefix || '')}
                        </FR>
                    </FR>
                </Tooltip>
            </FC>
        </Zoom>
    );
};

export default UserPrivilege;
