import React, {useEffect, useState} from 'react';
import {useApi} from "Modules/Api/useApi";
import {Message} from "Core/components/Message";
import CircularProgress from "Core/components/elements/CircularProgress";
import {useTheme} from "Theme/ThemeContext";
import {IPrivilege} from "../types/base";
import {FC, FCCC, FRBC, FRC, FRSC} from "WideLayout/Layouts";

interface ICurrentPrivilegeResponse {
    privilege: IPrivilege | null;
    total_donate_amount: number;
}

const PrivilegesView: React.FC = () => {
    const {api} = useApi();
    const {plt} = useTheme();

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
                Message.error('Ошибка загрузки привилегий');
                setPrivileges([]);
                setTotalDonate(0);
            })
            .finally(() => setLoading(false));
    }, [api]);

    if (loading) return <FCCC><CircularProgress size="60px"/></FCCC>;
    if (!privileges || privileges.length === 0) return <FRC>Привилегий нет</FRC>;
    if (totalDonate === null) return null;

    // Сортировка привилегий по порогу (threshold) от меньшего к большему
    const sortedPrivileges = [...privileges].sort(
        (a, b) => parseFloat(a.threshold) - parseFloat(b.threshold)
    );

    // Определяем минимальный и максимальный пороги
    const minThreshold = parseFloat(sortedPrivileges[0].threshold);
    const maxThreshold = parseFloat(sortedPrivileges[sortedPrivileges.length - 1].threshold);

    // Формируем плавный градиент (от minThreshold к maxThreshold)
    let gradientStops: string[] = [];
    sortedPrivileges.forEach((priv) => {
        const thresholdValue = parseFloat(priv.threshold);
        const pos = ((thresholdValue - minThreshold) / (maxThreshold - minThreshold)) * 100;
        gradientStops.push(`${priv.color || plt.text.accent} ${pos}%`);
    });

    // Добавляем 0% и 100% если не хватает
    if (gradientStops.length && !gradientStops[0].includes('0%')) {
        gradientStops.unshift(`${sortedPrivileges[0].color || plt.text.accent} 0%`);
    }
    if (gradientStops.length && !gradientStops[gradientStops.length - 1].includes('100%')) {
        gradientStops.push(`${sortedPrivileges[sortedPrivileges.length - 1].color || plt.text.accent} 100%`);
    }
    const gradientBackground = `linear-gradient(to bottom, ${gradientStops.join(', ')})`;

    // Высота полосы (в процентах от контейнера)
    const progressHeight = 80; // например, 80%
    // Отступ сверху (или снизу), чтобы полоса не была во всю высоту
    const progressVPadding = (100 - progressHeight) / 2; // = 10%, если 80%

    // Подсчёт прогресса (процент), где 0% = minThreshold, 100% = maxThreshold
    let donationPercent = ((totalDonate - minThreshold) / (maxThreshold - minThreshold)) * 100;
    if (donationPercent < 0) donationPercent = 0;
    if (donationPercent > 100) donationPercent = 100;

    // Фактическая высота заливки (цвета) в %
    // от всей полосы (которая занимает progressHeight% контейнера)
    const userProgressHeight = (donationPercent / 100) * progressHeight;
    const progressWidth = 5;

    return (
        <FC g={1} w={'100%'} pos={'relative'} style={{overflow: 'hidden'}}>
            {/* Вертикальная полоса с плавным градиентом */}
            <FRSC pos={'absolute'} left={2} bottom={`${progressVPadding}%`}
                  w={`${progressWidth}px`} h={`${progressHeight}%`}
                  rounded={1} style={{background: gradientBackground}}>
                {/* Заливка (прогресс) снизу вверх: "открытая часть" – это и есть прогресс */}
                <FC pos={'absolute'} left={0} bottom={`${progressVPadding}%`} rounded={1}
                    w={`${progressWidth}px`} h={`${userProgressHeight}%`} bg={plt.text.accent}
                />
            </FRSC>

            {/* Список привилегий (правее полосы) */}
            {sortedPrivileges.map((priv) => (
                <FRSC g={2} key={priv.id}>
                    <FC key={priv.id} rounded={6} w={'10px'} h={'10px'} sx={{opacity: '90%'}}
                        bg={priv.color || plt.text.accent} border={'1px solid #fff2'}/>
                    <FRBC g={2} w={'100%'}>
                        <FRC>{priv.threshold}₴</FRC>
                        <FRC fontWeight={'bold'}
                             rounded={1} px={2} py={0.5}
                             color={'#fff'} bg={priv.color || plt.text.accent}>
                            {priv.name}
                        </FRC>
                    </FRBC>
                </FRSC>
            ))}
        </FC>
    );
};

export default PrivilegesView;


