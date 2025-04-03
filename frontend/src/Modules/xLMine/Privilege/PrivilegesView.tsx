import React, {useEffect, useState} from 'react';
import {useApi} from "Modules/Api/useApi";
import {Message} from "Core/components/Message";
import CircularProgress from "Core/components/elements/CircularProgress";
import {useTheme} from "Theme/ThemeContext";
import {IPrivilege} from "../types/base";
import {FRCC} from "WideLayout/Layouts";

const PrivilegesView: React.FC = () => {
    const {api} = useApi();
    const {plt} = useTheme();

    // Список привилегий
    const [privileges, setPrivileges] = useState<IPrivilege[] | null>(null);
    // Флаг загрузки
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        setLoading(true);
        // Предполагаем, что эндпоинт: GET /api/v1/xlmine/privileges/
        api.get<IPrivilege[]>('/api/v1/xlmine/privilege/')
            .then(data => {
                setPrivileges(data);
            })
            .catch(() => {
                Message.error('Ошибка загрузки привилегий');
                setPrivileges([]);
            })
            .finally(() => setLoading(false));
    }, [api]);

    if (loading) return <FRCC><CircularProgress size="60px"/> </FRCC>;
    if (!privileges || privileges.length === 0) return <FRCC>Нет привилегий</FRCC>;

    // Преобразуем threshold в число
    const thresholdNumbers = privileges.map(p => parseFloat(p.threshold));
    // Ищем минимальный и максимальный порог
    const minThreshold = Math.min(...thresholdNumbers);
    const maxThreshold = Math.max(...thresholdNumbers);

    // Если все пороги равны (например, 0) — сделаем maxThreshold = minThreshold+1, чтобы избежать деления на 0.
    const range = (maxThreshold === minThreshold)
        ? 1
        : (maxThreshold - minThreshold);

    return (
        <div style={{width: '100%', padding: '1rem 0'}}>
            <h2 style={{textAlign: 'center', marginBottom: '1rem'}}>Привилегии</h2>
            <div style={{
                position: 'relative',
                height: '80px',
                width: '100%',
                margin: 'auto',
                maxWidth: '800px',
            }}>
                {/* Линия (ось) по центру по вертикали */}
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',  // по центру
                        left: 0,
                        right: 0,
                        height: '2px',
                        background: plt.text.primary50, // например серый
                        transform: 'translateY(-50%)'
                    }}
                />

                {/* Рисуем каждую привилегию как «точку» на линии */}
                {privileges.map(priv => {
                    const t = parseFloat(priv.threshold);
                    // Нормируем
                    const ratio = (t - minThreshold) / range;
                    // Получаем процент от 0% до 100%
                    const leftPercent = ratio * 100;

                    return (
                        <div key={priv.id} style={{
                            position: 'absolute',
                            // Размещаем по оси X
                            left: `${leftPercent}%`,
                            // Посадим «точку» в середине высоты
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            textAlign: 'center',
                            cursor: 'default'
                        }}>
                            {/* 
                              Можно нарисовать точку (или иконку). 
                              Ниже – прямоугольник с заливкой (цвет, если есть).
                            */}
                            <div style={{
                                backgroundColor: priv.color || plt.text.accent,
                                color: '#fff',
                                padding: '4px 8px',
                                borderRadius: '3px',
                                whiteSpace: 'nowrap'
                            }}>{priv.name}</div>
                            {/* Чуть ниже можно добавить порог для наглядности */}
                            <div style={{marginTop: '4px', fontSize: '.8rem', color: plt.text.primary60}}>
                                порог: {priv.threshold}
                            </div>
                        </div>
                    );
                })}

            </div>
        </div>
    );
};

export default PrivilegesView;
