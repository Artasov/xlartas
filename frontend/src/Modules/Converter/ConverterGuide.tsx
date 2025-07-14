// src/components/ConverterGuide.tsx
import React, {useEffect, useState} from 'react';
import {Box, Button, Collapse, Paper, Typography} from '@mui/material';
import {FC} from 'wide-containers';

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
                    <Typography variant="h6">Как пользоваться конвертером</Typography>

                    <Typography variant="body2">1. Перетащите файл или кликните, чтобы выбрать его.</Typography>
                    <Typography variant="body2">2. Проверьте, что исходный формат определился корректно.</Typography>
                    <Typography variant="body2">3. Выберите целевой формат и, при необходимости, задайте
                        параметры.</Typography>
                    <Typography variant="body2">4. Нажмите «Convert» и дождитесь окончания обработки, затем скачайте
                        результат.</Typography>

                    <Box mt={2}>
                        <Button size="small" onClick={handleClose} sx={{fontWeight: 'bold'}}>
                            Больше не показывать
                        </Button>
                    </Box>
                </FC>
            </Paper>
        </Collapse>
    );
};

export default ConverterGuide;
