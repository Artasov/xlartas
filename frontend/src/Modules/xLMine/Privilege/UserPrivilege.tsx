// Modules/xLMine/Privilege/UserPrivilege.tsx
import React, {useEffect, useState} from 'react';
import {useApi} from '../../Api/useApi';
import {FC, FR, FRCC} from 'wide-containers';
import CircularProgress from 'Core/components/elements/CircularProgress';
import {Message} from 'Core/components/Message';
import Tooltip from '@mui/material/Tooltip';
import {IPrivilege} from '../types/base';
import {useTranslation} from 'react-i18next';

const UserPrivilege: React.FC = () => {
    const {api} = useApi();
    const [privilege, setPrivilege] = useState<IPrivilege | null | undefined>(undefined);
    const {t} = useTranslation();

    /** превращаем "&#RRGGBBХ"‑строку в набор span‑ов */
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

    if (privilege === undefined) {
        return (
            <FRCC>
                <CircularProgress size={22}/>
            </FRCC>
        );
    }
    if (!privilege) return null; // Нет привилегий

    return (
        <FC g={1} color={privilege.color || '#aa00aa'} height="min-content">
            <Tooltip title={privilege.description || ''}>
                {/* обёртка <span> делает children единичным ReactElement‑ом */}
                <FR>
                    <FR>{renderGradient(privilege.prefix || '')}</FR>
                    <FR pos={'absolute'}
                        sx={{filter: 'blur(10px) contrast(2) brightness(2)'}}>{renderGradient(privilege.prefix || '')}</FR>
                </FR>
            </Tooltip>
        </FC>
    );
};

export default UserPrivilege;
