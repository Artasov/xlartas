// src/Modules/xLMine/UserPrivilege.tsx

import React, {useEffect, useState} from 'react';
import {useApi} from '../../Api/useApi';
import {FCC, FRCC} from 'WideLayout/Layouts';
import CircularProgress from "Core/components/elements/CircularProgress";
import {Message} from "Core/components/Message";
import {IPrivilege} from "../types/base";


const UserPrivilege: React.FC = () => {
    const {api} = useApi();
    const [privilege, setPrivilege] = useState<IPrivilege | null | undefined>(undefined);

    useEffect(() => {
        api.get('/api/v1/xlmine/privilege/current/')
            .then(data => {
                if (data.privilege === null) {
                    // Нет привилегии
                    setPrivilege(null);
                } else {
                    // data = { name, threshold, color, ... }
                    setPrivilege(data.privilege);
                }
            })
            .catch(err => {
                Message.error('Ошибка загрузки привилегии');
                setPrivilege(null);
            });
    }, [api]);

    if (privilege === undefined) return <FRCC><CircularProgress size={'40'}/></FRCC>;
    if (!privilege) return <span>Привилегий нет</span>;

    return (
        <FCC g={1} color={privilege.color || '#aa00aa'}>
            <h3 style={{margin: 0}}>{privilege.name}</h3>
            {privilege.description && <p>{privilege.description}</p>}
        </FCC>
    );
};

export default UserPrivilege;
