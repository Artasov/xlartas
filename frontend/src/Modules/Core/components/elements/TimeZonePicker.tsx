// Modules/Core/components/elements/TimeZonePicker.tsx

import React, {useMemo} from 'react';
import {FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, SxProps, Theme,} from '@mui/material';
import {getTimeZones, TimeZone} from '@vvo/tzdb';
import {useTheme} from "Theme/ThemeContext";

interface TimeZonePickerProps {
    label?: string;
    value: string;
    onChange: (event: SelectChangeEvent<string>) => void;
    name?: string;
    size?: 'small' | 'medium';
    className?: string;
    sx?: SxProps<Theme>;
}

const TimeZonePicker: React.FC<TimeZonePickerProps> = (
    {
        label = 'Временная зона',
        value,
        onChange,
        name = 'timezone',
        size = 'small',
        className,
        sx,
    }) => {
    const {plt} = useTheme();

    const popularTimezones = useMemo(
        () => [
            'UTC',
            'Europe/London',
            'Europe/Berlin',
            'Europe/Moscow',
            'Asia/Tokyo',
            'Asia/Shanghai',
            'Asia/Singapore',
            'Asia/Dubai',
            'Asia/Kolkata',
            'Australia/Sydney',
            'America/New_York',
            'America/Los_Angeles',
            'America/Chicago',
            'America/Sao_Paulo',
        ],
        []
    );

    // Получаем информацию о популярных временных зонах
    const timezones = useMemo(() => {
        const allTimeZones = getTimeZones();
        return allTimeZones.filter((tz: TimeZone) => popularTimezones.includes(tz.name));
    }, [popularTimezones]);

    const handleChange = (event: SelectChangeEvent<string>) => {
        onChange(event);
    }
    return (
        <FormControl
            fullWidth
            margin="none"
            className={className}
            sx={sx}
        >
            <InputLabel id={`${name}-label`}>{label}</InputLabel>
            <Select
                labelId={`${name}-label`}
                label={label}
                name={name}
                size={size}
                value={value}
                onChange={handleChange}
                // Применяем стили из темы, если необходимо
                sx={{
                    // Пример использования темы
                    '& .MuiSelect-select': {
                        color: plt.text.primary70,
                    },
                    ...sx, // Позволяет переопределить стили через пропс sx
                }}>
                {timezones.map((tz) => {
                    // Извлекаем название города из tz.name
                    const cityName = tz.name.split('/')[1]?.replace('_', ' ') || tz.name;
                    // Вычисляем числовое смещение
                    const offsetInHoursNum = tz.currentTimeOffsetInMinutes / 60;
                    const offsetInHours = offsetInHoursNum.toFixed(1);
                    // Форматируем offset в строку вида UTC+3 или UTC-5
                    const offsetString = `UTC ${offsetInHoursNum >= 0 ? '+' : ''}${Number(offsetInHours)}`;
                    return (
                        <MenuItem key={tz.name} value={tz.name}>
                            <span style={{color: plt.text.primary70}}>
                                {cityName} {offsetString}
                            </span>
                        </MenuItem>
                    );
                })}
            </Select>
        </FormControl>
    );
};

export default TimeZonePicker;
