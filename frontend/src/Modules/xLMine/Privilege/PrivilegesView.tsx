// Modules/xLMine/Privilege/PrivilegesView.tsx
import React, {useEffect, useState} from 'react';
import {useApi} from "Modules/Api/useApi";
import {Message} from "Core/components/Message";
import CircularProgressZoomify from "Core/components/elements/CircularProgressZoomify";
import {useTheme} from "Theme/ThemeContext";
import {IPrivilege} from "../types/base";
import {FC, FCCC, FRSC} from "wide-containers";
import PrivilegeItem from "./PrivilegeItem";
import {useTranslation} from 'react-i18next';

interface ICurrentPrivilegeResponse {
    privilege: IPrivilege | null;
    total_donate_amount: number;
}


const PrivilegesView: React.FC = () => {
    const {api} = useApi();
    const {plt} = useTheme();
    const {t} = useTranslation();

    // Список всех привилегий
    const [privileges, setPrivileges] = useState<IPrivilege[] | null>(null);
    // Сумма доната текущего пользователя
    const [totalDonate, setTotalDonate] = useState<number | null>(null);
    // Состояние загрузки
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.get<IPrivilege[]>('/api/v1/xlmine/privilege/'),
            api.get<ICurrentPrivilegeResponse>('/api/v1/xlmine/privilege/current/')
        ])
            .then(([privData, currentData]) => {
                setPrivileges(privData);
                setTotalDonate(currentData.total_donate_amount);
            })
            .catch(() => {
                Message.error(t('privileges_load_error'));
                setPrivileges([]);
                setTotalDonate(0);
            })
            .finally(() => setLoading(false));
    }, [api]);

    if (loading) return <FCCC><CircularProgressZoomify in size="60px"/></FCCC>;
    if (!privileges || privileges.length === 0) return null; // Привилегий нет у юзера
    if (totalDonate === null) return null;

    // Сортировка привилегий по порогу (threshold) от меньшего к большему
    const sortedPrivileges = [...privileges].sort(
        (a, b) => parseFloat(a.threshold) - parseFloat(b.threshold)
    );

    // Определяем минимальный и максимальный пороги
    const minThreshold = parseFloat(sortedPrivileges[0].threshold);
    const maxThreshold = parseFloat(sortedPrivileges[sortedPrivileges.length - 1].threshold);

    // Формирование равномерных градиентных точек (точки распределяются по индексам)
    const n = sortedPrivileges.length;
    const gradientStops = sortedPrivileges.map((priv, index) => {
        const pos = (index / (n - 1)) * 100;
        return `${priv.color || plt.text.accent} ${pos}%`;
    });
    const gradientBackground = `linear-gradient(to bottom, ${gradientStops.join(', ')})`;

    // Высота полосы (в процентах от контейнера)
    const progressHeight = 90; // например, 90%
    // Отступ сверху (или снизу), чтобы полоса не была во всю высоту
    const progressVPadding = (100 - progressHeight) / 2; // = 5%, если 90%

    // Подсчёт прогресса (процент), где 0% = minThreshold, 100% = maxThreshold
    let donationPercent = ((totalDonate - minThreshold) / (maxThreshold - minThreshold)) * 100;
    if (donationPercent < 0) donationPercent = 0;
    if (donationPercent > 100) donationPercent = 100;

    // Фактическая высота заливки (цвета) в % от всей полосы (которая занимает progressHeight% контейнера)
    const userProgressHeight = (donationPercent / 100) * progressHeight;
    const progressWidth = 5;

    return (
        <FC pl={2.5} g={1} w={'100%'} pos={'relative'} scroll={'hidden'}>
            {/* Вертикальная полоса с равномерным градиентом */}
            <FRSC pos={'absolute'} left={22.4} bottom={`${progressVPadding}%`}
                  w={`${progressWidth}px`} h={`${progressHeight}%`}
                  rounded={1} style={{background: gradientBackground}}>
                <FC pos={'absolute'} left={0} bottom={`${progressVPadding}%`} rounded={1}
                    w={`${progressWidth}px`} h={`${userProgressHeight}%`} bg={plt.text.accent}/>
            </FRSC>
            {/* Свечение */}
            <FRSC pos={'absolute'} left={22.4} bottom={`${progressVPadding}%`}
                  w={`${progressWidth}px`} h={`${progressHeight}%`}
                  rounded={1} style={{background: gradientBackground, filter: 'blur(10px)'}}/>

            {/* Список привилегий (правее полосы) */}
            {sortedPrivileges.map((priv) => (
                <PrivilegeItem key={priv.id} priv={priv}/>
            ))}
        </FC>
    );
};

export default PrivilegesView;
