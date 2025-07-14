import React from 'react';
import {Typography} from '@mui/material';
import {IFormat} from 'types/converter';
import {FR} from "wide-containers";
import {useTheme} from 'Modules/Theme/ThemeContext';
import Collapse from "@mui/material/Collapse";

interface Props {
    formats: IFormat[];
    value?: number;
    onChange: (id: number) => void;
}

const FormatPicker: React.FC<Props> = ({formats, value, onChange}) => {
    const {plt, theme} = useTheme();
    return (
        <Collapse in={formats && formats.length !== 0} unmountOnExit timeout={400}>
            <FR g={1} wrap>
                {formats.map(fmt => (
                    <FR key={fmt.id}>
                        <FR cursorPointer px={2} py={1} rounded={1} sx={{
                            backgroundColor: value === fmt.id
                                ? theme.colors.primary.main
                                : plt.text.primary,

                        }} onClick={() => onChange(fmt.id)}

                        >
                            {fmt.icon && <img src={fmt.icon} alt={fmt.name} width={24} style={{marginRight: 4}}/>}
                            <Typography sx={{
                                fontWeight: '600',
                                fontSize: '1.2rem',
                                color: value === fmt.id
                                    ? plt.text.primary
                                    : plt.primary.contrastText,
                            }} variant="body2">{fmt.name}</Typography>
                        </FR>
                    </FR>
                ))}
            </FR>
        </Collapse>
    );
};

export default FormatPicker;
