// Modules/Core/components/elements/CustomDatePicker.tsx
import React, {useState} from 'react';
import {IconButton, Popover} from '@mui/material';
import {CalendarToday} from '@mui/icons-material';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFnsV3';
import {DateCalendar} from '@mui/x-date-pickers/DateCalendar';
import {format} from 'date-fns';
import {ru} from 'date-fns/locale/ru';
import TextField from "Core/components/elements/TextField/TextField";

interface CustomDatePickerProps {
    label: string;
    value: Date | null;
    onChange: (date: Date | null) => void;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({label, value, onChange}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    const handleDateChange = (newDate: Date | null) => {
        onChange(newDate);
        handleClose(); // Закрываем календарь после выбора даты
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
            <div style={{position: 'relative'}}>
                <TextField
                    label={label}
                    variant="outlined"
                    size="small"
                    baseSx={{
                        paddingRight: '0px'
                    }}
                    style={{
                        width: 'min-content',
                        minWidth: value ? '150px' : '175px'
                    }}
                    onClick={handleOpen}
                    value={value ? format(value, 'yyyy-MM-dd') : ''}
                    onChange={() => {
                    }} // Отключаем прямое изменение текста
                    inputProps={{readOnly: true}} // Делаем поле только для чтения
                    InputProps={{
                        endAdornment: (
                            <IconButton onClick={handleOpen}>
                                <CalendarToday/>
                            </IconButton>
                        )
                    }}
                />
                <Popover
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left'
                    }}
                >
                    <DateCalendar value={value} onChange={handleDateChange}/>
                </Popover>
            </div>
        </LocalizationProvider>
    );
};

export default CustomDatePicker;
