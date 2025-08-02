'use client';

import React from 'react';
import {Box, Grid, Tooltip} from '@mui/material';
import {Skill} from "Modules/DevResume/types";
import { FC } from 'wide-containers';

export default function TechnologyGrid({skills}: { skills: Skill[] }) {
    return (
        <FC bg={'#000'}><Grid container spacing={0} alignItems={'center'} justifyContent={'center'} sx={{
            backgroundColor: '#000'
        }}>
            {skills.map(({name, Icon, color = 'inherit', scale = 1}) => (
                <Grid
                    size={{xs: .1, sm: .1,}}
                    key={name}
                    sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 40}}
                >
                    <FC mb={1}>
                        <Tooltip arrow placement="right" title={name}>
                            <Box sx={{transform: `scale(${scale})`, color: '#fff'}}>
                                <Icon size={32}/>
                            </Box>
                        </Tooltip>
                    </FC>
                    {/*<Typography variant="caption" align="center" lineHeight={'1rem'}>*/}
                    {/*    {name}*/}
                    {/*</Typography>*/}
                </Grid>
            ))}
        </Grid></FC>
    );
}
