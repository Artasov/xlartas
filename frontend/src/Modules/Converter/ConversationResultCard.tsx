// Modules/Converter/ConversationResultCard.tsx
import React from 'react';
import {IconButton, Typography} from '@mui/material';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import {IConversion} from 'types/converter';
import formatFileSize from 'Utils/formatFileSize';
import {useTheme} from 'Modules/Theme/ThemeContext';
import {FRBC} from "wide-containers";

interface ConversationResultCardProps {
    conversion: IConversion | null;
}

const ConversationResultCard: React.FC<ConversationResultCardProps> = ({conversion}) => {
    const {plt} = useTheme();
    if (!conversion?.is_done || !conversion.output_file) return null;

    return (
        <FRBC w={'100%'} wrap mt={1} bg={plt.text.primary + '0d'} p={1} rounded={1}>
            <Typography sx={{color: plt.text.primary + 'dd'}}>
                {conversion.output_name ?? conversion.output_file.split('/')?.pop()}
            </Typography>
            {typeof conversion.size === 'number' && (
                <Typography variant="caption">
                    {formatFileSize(conversion.size)}
                </Typography>
            )}
            <IconButton
                color="primary"
                href={`/api/v1/converter/download/${conversion.id}/`}
                download
            >
                <DownloadRoundedIcon/>
            </IconButton>
        </FRBC>
    );
};

export default ConversationResultCard;
