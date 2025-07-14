import React from 'react';
import {MenuItem, TextField, InputAdornment} from '@mui/material';
import {IParameter} from 'types/converter';

interface Props {
    parameters: IParameter[];
    values: Record<string, any>;
    onChange: (name: string, value: any) => void;
}

const ParameterForm: React.FC<Props> = ({parameters, values, onChange}) => {
    return (
        <>
            {parameters.map(p => {
                const value = values[p.name];
                switch (p.type) {
                    case 'bool':
                        return (
                            <TextField
                                select
                                SelectProps={{displayEmpty: true}}
                                key={p.name}
                                label={p.name}
                                value={value === true ? 'true' : value === false ? 'false' : ''}
                                onChange={e => {
                                    const v = e.target.value;
                                    onChange(p.name, v === '' ? null : v === 'true');
                                }}
                                fullWidth size={'small'}
                            >
                                <MenuItem value="">Like source</MenuItem>
                                <MenuItem value="true">True</MenuItem>
                                <MenuItem value="false">False</MenuItem>
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
                                    onChange(p.name, v === '' ? null : Number(v));
                                }}
                                placeholder="Like source"
                                InputProps={{
                                    endAdornment: p.unit ? (
                                        <InputAdornment position="end">{p.unit}</InputAdornment>
                                    ) : undefined,
                                }}
                                fullWidth size={'small'}
                            />
                        );
                    case 'select':
                        return (
                            <TextField
                                select
                                SelectProps={{displayEmpty: true}}
                                key={p.name}
                                label={p.name}
                                value={value ?? ''}
                                onChange={e => onChange(p.name, e.target.value || null)}
                                fullWidth size={'small'}
                            >
                                <MenuItem value="">Like source</MenuItem>
                                {p.options?.map(opt => (
                                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
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
                                placeholder="Like source"
                                InputProps={{
                                    endAdornment: p.unit ? (
                                        <InputAdornment position="end">{p.unit}</InputAdornment>
                                    ) : undefined,
                                }}
                                fullWidth size={'small'}
                            />
                        );
                }
            })}
        </>
    );
};

export default ParameterForm;
