// Modules/Converter/FormatParametersSettings.tsx
import React from 'react';
import {InputAdornment, MenuItem, TextField} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {IParameter} from 'types/converter';

interface Props {
    parameters: IParameter[];
    values: Record<string, any>;
    onChange: (name: string, value: any) => void;
}

const FormatParametersSettings: React.FC<Props> = ({parameters, values, onChange}) => {
    // один общий набор slotProps, чтобы label всегда «припаркован» наверху
    const labelShrink = {inputLabel: {shrink: true}} as const;
    const {t} = useTranslation();

    return (
        <>
            {parameters.map(p => {
                const value = values[p.name];

                switch (p.type) {
                    case 'bool':
                        return (
                            <TextField
                                key={p.name}
                                select
                                label={p.name}
                                value={value === true ? 'true'
                                    : value === false ? 'false'
                                        : ''}
                                onChange={e => {
                                    const v = e.target.value;
                                    onChange(p.name, v === ''
                                        ? null
                                        : v === 'true');
                                }}
                                fullWidth
                                size="small"
                                slotProps={{
                                    select: {displayEmpty: true},
                                    ...labelShrink
                                }}
                            >
                                <MenuItem value="">{t('like_source')}</MenuItem>
                                <MenuItem value="true">{t('bool_true')}</MenuItem>
                                <MenuItem value="false">{t('bool_false')}</MenuItem>
                            </TextField>
                        );

                    case 'int':
                        return (
                            <TextField
                                key={p.name}
                                type="number"
                                label={p.name}
                                value={value ?? ''}
                                onChange={e => {
                                    const v = e.target.value;
                                    onChange(p.name, v === ''
                                        ? null
                                        : Number(v));
                                }}
                                placeholder={t('like_source')}
                                fullWidth
                                size="small"
                                slotProps={{
                                    input: {
                                        endAdornment: p.unit
                                            ? <InputAdornment position="end">{p.unit}</InputAdornment>
                                            : undefined
                                    },
                                    ...labelShrink
                                }}
                            />
                        );

                    case 'select':
                        return (
                            <TextField
                                key={p.name}
                                select
                                label={p.name}
                                value={value ?? ''}
                                onChange={e => onChange(p.name, e.target.value || null)}
                                fullWidth
                                size="small"
                                slotProps={{
                                    select: {displayEmpty: true},
                                    ...labelShrink
                                }}
                            >
                                <MenuItem value="">{t('like_source')}</MenuItem>
                                {p.options?.map(opt => (
                                    <MenuItem key={opt} value={opt}>
                                        {opt}
                                    </MenuItem>
                                ))}
                            </TextField>
                        );

                    default:
                        return (
                            <TextField
                                key={p.name}
                                label={p.name}
                                value={value ?? ''}
                                onChange={e => onChange(p.name, e.target.value || null)}
                                placeholder={t('like_source')}
                                fullWidth
                                size="small"
                                slotProps={{
                                    input: {
                                        endAdornment: p.unit
                                            ? <InputAdornment position="end">{p.unit}</InputAdornment>
                                            : undefined
                                    },
                                    ...labelShrink
                                }}
                            />
                        );
                }
            })}
        </>
    );
};

export default FormatParametersSettings;
