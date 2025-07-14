// Modules/Converter/ConverterGuide.tsx
import React, {useEffect, useState} from 'react';
import {Box, Button, Collapse, Paper, Typography} from '@mui/material';
import {FC} from 'wide-containers';
import {useTranslation} from 'react-i18next';

/**
 * Гайд-подсказка для конвертера.
 *
 * • Плавно появляется при первом посещении (если пользователь ещё не скрывал его).
 * • Кнопка «Больше не показывать» заносит отметку в localStorage и плавно сворачивает блок.
 * • При повторных посещениях, пока в localStorage сохранён флаг, подсказка не отображается.
 */

const LOCAL_STORAGE_KEY = 'converterGuideHidden';

const ConverterGuide: React.FC = () => {
    const [open, setOpen] = useState(false);
    const {t} = useTranslation();

    /* ---------- 🪄 Считываем состояние из localStorage при инициализации ---------- */
    useEffect(() => {
        const hidden = localStorage.getItem(LOCAL_STORAGE_KEY) === '1';
        setOpen(!hidden);
    }, []);

    /* ---------- 🚫 Обработка клика «Больше не показывать» ---------- */
    const handleClose = () => {
        setOpen(false);
        localStorage.setItem(LOCAL_STORAGE_KEY, '1');
    };

    return (
        <Collapse in={open} mountOnEnter unmountOnExit timeout={400}>
            <Paper elevation={1} sx={{p: 2}}>
                <FC g={1}>
                    <Typography variant="h6">{t('converter_guide_title')}</Typography>

                    <Typography variant="body2">{t('converter_guide_step1')}</Typography>
                    <Typography variant="body2">{t('converter_guide_step2')}</Typography>
                    <Typography variant="body2">{t('converter_guide_step3')}</Typography>
                    <Typography variant="body2">{t('converter_guide_step4')}</Typography>

                    <Box mt={2}>
                        <Button size="small" onClick={handleClose} sx={{fontWeight: 'bold'}}>
                            {t('converter_hide')}
                        </Button>
                    </Box>
                </FC>
            </Paper>
        </Collapse>
    );
};

export default ConverterGuide;
