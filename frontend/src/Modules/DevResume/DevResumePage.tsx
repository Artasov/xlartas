// Modules/DevResume/DevResumePage.tsx
'use client';

import React from 'react';
import {Avatar, Box, Typography} from '@mui/material';
import TechnologyGrid from './TechnologyGrid';
import {skills} from './skills';
import headerBg from 'Static/img/dev_resume/dev-resume-bg.png';
import headerAva from 'Static/img/dev_resume/cj3ogBvDp24.jpg';

/* ───────────────────── Опыт ───────────────────── */
const experiences = [
    {
        role: 'Software Engineer',
        company: 'Company A',
        period: '2020 – Present',
        description: 'Placeholder experience. Replace with actual details from LinkedIn.',
    },
];

/* ─────────────────── Страница резюме ─────────────────── */
export default function DevResumePage() {
    return (
        <Box sx={{p: 2}} maxWidth={1000} alignSelf={'center'}>
            {/* Шапка */}
            <Box sx={{
                display: 'flex', alignItems: 'center', gap: 2, position: 'relative',
                minHeight: 200
            }}>
                <Box
                    component="img"
                    src={headerBg.src}
                    alt="Header bg"
                    width={'100%'} height={'100%'}
                    position={'absolute'}
                    sx={{objectFit: 'cover'}}
                    borderRadius={'1.2rem'}
                />
            </Box>

            <Box position={'relative'} mt={1}>
                <Avatar
                    src={headerAva.src}
                    alt="Avatar"
                    sx={{
                        width: 120, height: 120,
                        position: 'absolute',
                        bottom: 0
                    }}
                />
                <Typography variant="h4" sx={{ml: 15}}>Nikita Artasov</Typography>
            </Box>

            {/* Блок «Обо мне» */}
            <Box my={2}>
                <Typography variant="h5" gutterBottom>About Me</Typography>
                <Typography>
                    This is a placeholder about-me section. Replace this text with a brief description
                    about yourself.
                </Typography>
            </Box>

            {/* Технологии */}
            <Box my={2}>
                <TechnologyGrid skills={skills}/>
            </Box>
            {/* Опыт */}
            <Box sx={{mb: 4}}>
                <Typography variant="h5" gutterBottom>Experience</Typography>
                {experiences.map(({role, company, period, description}) => (
                    <Box key={role} sx={{mb: 2}}>
                        <Typography variant="subtitle1">
                            <strong>{role}</strong>&nbsp;–&nbsp;{company}
                        </Typography>
                        <Typography variant="caption" display="block">{period}</Typography>
                        <Typography>{description}</Typography>
                    </Box>
                ))}
            </Box>

        </Box>
    );
}
