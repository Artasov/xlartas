import React from 'react';
import {Button, Grid, Typography} from '@mui/material';
import {IFormat} from 'types/converter';

interface Props {
    formats: IFormat[];
    value?: number;
    onChange: (id: number) => void;
}

const FormatPicker: React.FC<Props> = ({formats, value, onChange}) => {
    return (
        <Grid container spacing={2}>
            {formats.map(fmt => (
                <Grid item key={fmt.id}>
                    <Button
                        variant={value === fmt.id ? 'contained' : 'outlined'}
                        onClick={() => onChange(fmt.id)}
                    >
                        {fmt.icon && <img src={fmt.icon} alt={fmt.name} width={24} style={{marginRight: 4}}/>}
                        <Typography variant="body2">{fmt.name}</Typography>
                    </Button>
                </Grid>
            ))}
        </Grid>
    );
};

export default FormatPicker;
