// src/Modules/Software/Macros/MacrosExecutorPage.tsx
import React, {useState} from 'react';
import {Tab, Tabs, Typography, useMediaQuery} from '@mui/material';
import {FC} from 'wide-containers';
import {useTheme} from 'Theme/ThemeContext';
import {MacroControlProvider} from './MacroControlProvider';
import MacrosWirelessDashboard from './MacrosWirelessDashboard';
import RemoteTouchpad from './RemoteTouchpad';
import RemoteKeyboardField from './RemoteKeyboardField';
import MacrosExecutorForm from './MacrosExecutorForm';

const MacrosExecutorPage: React.FC = () => {
    const {plt} = useTheme();

    const [mainTab, setMainTab] = useState<'control' | 'info'>('control');
    const [controlTab, setControlTab] = useState<'panel' | 'io' | 'byname'>('panel');
    const isGtSm = useMediaQuery('(min-width: 576px)');
    return (
        <MacroControlProvider>
            <FC w={'100%'} scroll="y-hidden" px={2} pt={isGtSm ? 2 : 0} g={1}>
                <Tabs value={mainTab} sx={{
                    minHeight: 30
                }}
                      onChange={(_, v) => setMainTab(v)} centered>
                    <Tab sx={{
                        py: 0, minHeight: 30
                    }} label="Control" value="control"/>
                    <Tab sx={{
                        py: 0, minHeight: 30
                    }} label="Info" value="info"/>
                </Tabs>

                {mainTab === 'control' && (
                    <>
                        <Tabs
                            value={controlTab}
                            onChange={(_, v) => setControlTab(v)}
                            centered
                            textColor="secondary"
                            indicatorColor="secondary" sx={{
                            minHeight: 30
                        }}>
                            <Tab sx={{
                                py: 0, minHeight: 30
                            }} label="Panel" value="panel"/>
                            <Tab sx={{
                                py: 0, minHeight: 30
                            }} label="M & K" value="io"/>
                            <Tab sx={{
                                py: 0, minHeight: 30
                            }} label="By Name" value="byname"/>
                        </Tabs>

                        {controlTab === 'panel' && <FC scroll={'y-auto'}><MacrosWirelessDashboard/></FC>}
                        {controlTab === 'io' && (
                            <FC g={1}>
                                <RemoteTouchpad/>
                                <RemoteKeyboardField/>
                            </FC>
                        )}
                        {controlTab === 'byname' && <FC>
                            <p style={{color: plt.text.primary50, marginBottom: '.6rem'}}>
                                Введите имя макроса (как в приложении) и нажмите
                                «Выполнить». PC, на котором запущен xLMACROS
                                с включённой опцией «Wireless control»,
                                запустит указанный макрос.
                            </p>
                            <MacrosExecutorForm/>
                        </FC>}
                    </>
                )}

                {mainTab === 'info' && (
                    <Typography sx={{color: plt.text.primary60, mt: 2}}>
                        Здесь может быть справка или описание возможностей. Заполните по необходимости.
                    </Typography>
                )}
            </FC>
        </MacroControlProvider>
    );
};

export default MacrosExecutorPage;
