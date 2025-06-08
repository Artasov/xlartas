import React from 'react';
import MacrosExecutorForm from './MacrosExecutorForm';
import MacrosWirelessDashboard from './MacrosWirelessDashboard';
import {FC} from 'WideLayout/Layouts';
import {useTheme} from 'Theme/ThemeContext';
import {Typography} from "@mui/material";

const MacrosExecutorPage: React.FC = () => {
    const {plt} = useTheme();

    return (
        <FC mx="auto" maxW={600} scroll={'y-hidden'}>
            <FC p={2} scroll={'auto'}>
                <Typography variant={'h1'} fontSize={'2rem'} textAlign={'left'} sx={{color: plt.text.primary80}}>
                    Выполнить макрос удалённо
                </Typography>

                <p style={{color: plt.text.primary50, marginTop: '.5rem', marginBottom: '.6rem'}}>
                    Введите точное имя макроса (как в настольном приложении) и нажмите
                    «Выполнить». Компьютер, на котором запущен xLMACROS
                    с включённой опцией «Управление по сети», немедленно
                    запустит указанный макрос.
                </p>

                <MacrosExecutorForm/>
                <MacrosWirelessDashboard/>
            </FC>
        </FC>
    );
};

export default MacrosExecutorPage;
