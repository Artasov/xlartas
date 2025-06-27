// Modules/Core/components/elements/CustomDateTimePicker.tsx
import React, {useState} from 'react';
import {Box, Button, IconButton, Popover} from '@mui/material';
import {CalendarToday} from '@mui/icons-material';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {DateCalendar} from '@mui/x-date-pickers/DateCalendar';
import {TimeClock} from '@mui/x-date-pickers/TimeClock';
import {format} from 'date-fns';
import {ru} from 'date-fns/locale';
import TextField from "@mui/material/TextField";

interface CustomDateTimePickerProps {
    label: string;
    className?: string;
    value: Date | null;
    onChange: (date: Date | null) => void;
}

const CustomDateTimePicker: React.FC<CustomDateTimePickerProps> = ({
                                                                       label,
                                                                       value,
                                                                       onChange,
                                                                       className,
                                                                   }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [tempDate, setTempDate] = useState<Date | null>(value || new Date());
    const [step, setStep] = useState<'date' | 'time'>('date');

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        setStep('date');
        setTempDate(value || new Date());
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    const handleDateChange = (newDate: Date | null) => {
        if (newDate) {
            setTempDate(newDate);
            setStep('time');
        }
    };

    const handleTimeChange = (newTime: Date | null) => {
        if (newTime && tempDate) {
            const updatedDateTime = new Date(
                tempDate.getFullYear(),
                tempDate.getMonth(),
                tempDate.getDate(),
                newTime.getHours(),
                newTime.getMinutes()
            );
            setTempDate(updatedDateTime);
        }
    };

    const handleConfirm = () => {
        if (tempDate) {
            onChange(tempDate);
            handleClose();
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
            <div className={`${className} position-relative`}>
                <TextField
                    label={label}
                    variant="outlined"
                    size="small"
                    style={{
                        width: 'min-content',
                        minWidth: value ? '200px' : '225px',
                    }}
                    onClick={handleOpen}
                    value={value ? format(value, 'yyyy-MM-dd HH:mm') : ''}
                    onChange={() => {
                    }}
                    inputProps={{readOnly: true}}
                    // TODO: OutlinedTextFieldProps. InputProps?: Partial<FilledInputProps> | Partial<OutlinedInputProps> | Partial<InputProps> | undefined
                    // Props applied to the Input element. It will be a FilledInput, OutlinedInput or Input component depending on the variant prop value.
                    // Deprecated:
                    // Use slotProps. input instead. This prop will be removed in a future major release. See Migrating from deprecated APIs  for more details.
                    InputProps={{
                        endAdornment: (
                            <IconButton onClick={handleOpen}>
                                <CalendarToday/>
                            </IconButton>
                        ),
                    }}
                />
                <Popover
                    open={open}
                    anchorEl={anchorEl}
                    onClose={() => {
                        setTempDate(value || new Date());
                        handleClose();
                    }}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                >
                    <Box>
                        {step === 'date' && (
                            <DateCalendar
                                value={tempDate}
                                onChange={handleDateChange}
                            />
                        )}
                        {step === 'time' && (
                            <Box>
                                <TimeClock
                                    value={tempDate}
                                    onChange={handleTimeChange}
                                    ampm={false}
                                />
                                <Box display="flex" justifyContent="center" p={1}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleConfirm}
                                    >
                                        Подтвердить
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Popover>
            </div>
        </LocalizationProvider>
    );
};

export default CustomDateTimePicker;
