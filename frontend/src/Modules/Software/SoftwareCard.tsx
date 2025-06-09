// Modules/Software/SoftwareCard.tsx

import React from 'react';
import {useTheme} from "Theme/ThemeContext";
import {ISoftware} from "./Types/Software";
import {FC, FRSE} from 'wide-containers';
import {Card, CardContent, CardMedia} from "@mui/material";

interface SoftwareCardProps {
    software: ISoftware;
    onClick: () => void;
}

const SoftwareCard: React.FC<SoftwareCardProps> = ({software, onClick}) => {
    const {plt} = useTheme();
    return (
        <Card onClick={onClick} sx={{cursor: 'pointer', maxWidth: 300}}>
            <CardMedia component="img"
                       height="140"
                       image={software.pic || ''}
                       alt={software.name}/>
            <CardContent>
                <FC pt={1} g={1}>
                    <FRSE g={'.1rem'}>
                        <h2 style={{
                            lineHeight: '1.4rem',
                            fontSize: '1.8rem',
                            margin: 0,
                        }}>
                            {software.name}
                        </h2>
                        {software.file && (
                            <span style={{
                                color: plt.text.primary30,
                                fontSize: '.8rem',
                                lineHeight: '.8rem'
                            }}>
                            v.{software.file.version}
                        </span>
                        )}
                    </FRSE>
                    <p style={{color: plt.text.primary50}}>
                        {software.short_description?.slice(0, 120)}
                        {(software.short_description && software.short_description.length > 120) ? '...' : ''}
                    </p>
                </FC>
            </CardContent>
        </Card>
    );
};

export default SoftwareCard;
