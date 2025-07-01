// Modules/Software/Macros/MacrosInfo.tsx
import React from 'react'
import {Divider, Typography} from '@mui/material'
import {FC} from 'wide-containers'
import {useTheme} from 'Theme/ThemeContext'

import {Trans, useTranslation} from 'react-i18next'

const MacrosInfo: React.FC = () => {
    const {plt} = useTheme()

    const {t} = useTranslation()

    return (
        <FC>
            <Typography
                variant="h5"
                sx={{color: plt.text.primary, mb: 2, fontWeight: 600}}
            >
                {t('how_works')}
            </Typography>
            <Divider sx={{bgcolor: plt.text.primary + '99', mb: 1, mt: .5}}/>
            <Typography sx={{color: plt.text.primary, mb: 1.5}}>
                <Trans i18nKey="step_on"/>
            </Typography>
            <Divider sx={{bgcolor: plt.text.primary + '99', my: 1}}/>
            <Typography sx={{color: plt.text.primary, mb: 1.5}}>
                <Trans i18nKey="step_socket"/>
            </Typography>
            <Typography sx={{color: plt.text.primary, my: 1}}>
                <Trans i18nKey="step_use"/>
            </Typography>
            <Divider sx={{bgcolor: plt.text.primary + '99', my: 1}}/>
            <Typography sx={{color: plt.text.primary, my: 1, fontStyle: 'italic'}}>
                <Trans i18nKey="step_if_not"/>
            </Typography>
            <Divider sx={{bgcolor: plt.text.primary + '99', my: 1}}/>
            <Typography sx={{color: plt.text.primary, my: 1}}>
                <Trans i18nKey="step_note"/>
            </Typography>

            <Divider sx={{bgcolor: plt.text.primary + '99', my: 1}}/>
            <Typography sx={{color: plt.text.primary, mt: 1, fontSize: '0.9rem'}}>
                <Trans i18nKey="step_tested"/>
            </Typography>
        </FC>
    )
}

export default MacrosInfo
