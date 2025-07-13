import React from 'react';
import {Checkbox, FormControlLabel, MenuItem, TextField, InputAdornment} from '@mui/material';
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
                            <FormControlLabel
                                key={p.name}
                                control={<Checkbox checked={!!value} onChange={e => onChange(p.name, e.target.checked)}/>} 
                                label={p.name}
                            />
                        );
                    case 'int':
                        return (
                            <TextField
                                key={p.name}
                                type="number"
                                label={p.name}
                                value={value || ''}
                                onChange={e => onChange(p.name, Number(e.target.value))}
                                InputProps={{
                                    endAdornment: p.unit ? (
                                        <InputAdornment position="end">{p.unit}</InputAdornment>
                                    ) : undefined,
                                }}
                                fullWidth
                                margin="normal"
                            />
                        );
                    case 'select':
                        return (
                            <TextField
                                select
                                key={p.name}
                                label={p.name}
                                value={value || ''}
                                onChange={e => onChange(p.name, e.target.value)}
                                fullWidth
                                margin="normal"
                            >
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
                                value={value || ''}
                                onChange={e => onChange(p.name, e.target.value)}
                                InputProps={{
                                    endAdornment: p.unit ? (
                                        <InputAdornment position="end">{p.unit}</InputAdornment>
                                    ) : undefined,
                                }}
                                fullWidth
                                margin="normal"
                            />
                        );
                }
            })}
        </>
    );
};

export default ParameterForm;
