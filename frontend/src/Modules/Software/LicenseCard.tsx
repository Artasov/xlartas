// Modules/Software/LicenseCard.tsx
import React from 'react';
import {useNavigate} from 'Utils/nextRouter';
import {Card, CardContent, CardMedia, Typography} from '@mui/material';
import {useTheme} from 'Theme/ThemeContext';
import {FC} from "wide-containers";
import {useTranslation} from 'react-i18next';

interface LicenseCardProps {
    license: any;
}

const LicenseCard: React.FC<LicenseCardProps> = ({license}) => {
    const navigate = useNavigate();
    const {plt, theme} = useTheme();
    const {t} = useTranslation();

    const handleClick = () => {
        navigate(`/softwares/${license.software.id}`);
    };

    return (
        <Card onClick={handleClick} sx={{cursor: 'pointer', maxWidth: 300}}>
            <CardMedia component="img"
                       height="140"
                       image={license.software.pic || ''}
                       alt={license.software.name}/>
            <CardContent>
                <FC g={.5}>
                    <Typography variant="h6" component="div">
                        {license.software.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t('hours', {count: license.remaining_hours})}
                    </Typography>
                </FC>
            </CardContent>
        </Card>
    );
};

export default LicenseCard;
