// Modules/Software/Macros/MacrosExecutorPage.tsx
import React, {useEffect, useState} from 'react';
import {Tab, Tabs, useMediaQuery} from '@mui/material';
import {FC, FCCC} from 'wide-containers';
import {useTheme} from 'Theme/ThemeContext';
import {MacroControlProvider} from './MacroControlProvider';
import MacrosWirelessDashboard from './MacrosWirelessDashboard';
import RemoteTouchpad from './RemoteTouchpad';
import RemoteKeyboardField from './RemoteKeyboardField';
import RemoteMouse from './RemoteMouse';
import MacrosExecutorForm from './MacrosExecutorForm';
import MacrosInfo from "./MacrosInfo";
import {ScreenViewerProvider} from './ScreenViewerProvider';
import ScreenViewer from "./ScreenViewer";
import {useTranslation} from "react-i18next";
import Collapse from '@mui/material/Collapse';

const MacrosExecutorPage: React.FC = () => {
    const {plt} = useTheme();
    const [mainTab, setMainTab] = useState<'control' | 'info'>('control');
    const [controlTab, setControlTab] =
        useState<'panel' | 'io' | 'byname'>('panel');
    const isGtSm = useMediaQuery('(min-width: 576px)');
    const {t} = useTranslation();
    const [animate, setAnimate] = useState(false);

    useEffect(() => setAnimate(true), []);

    return (
        <Collapse in={animate} appear timeout={400}>
            <MacroControlProvider>
                <FC w="100%" scroll="y-hidden" px={2} pt={isGtSm ? 2 : 0} g={1}>
                    <Tabs
                        value={mainTab}
                        onChange={(_, v) => setMainTab(v)}
                        centered
                        sx={{minHeight: 30}}
                    >
                        <Tab sx={{py: 0, minHeight: 30}} label={t('control')} value="control"/>
                        <Tab sx={{py: 0, minHeight: 30}} label={t('info')} value="info"/>
                    </Tabs>

                    {mainTab === 'control' && (
                        <>
                            <Tabs
                                value={controlTab}
                                onChange={(_, v) => setControlTab(v)}
                                centered
                                textColor="secondary"
                                indicatorColor="secondary"
                                sx={{minHeight: 30}}
                            >
                                <Tab sx={{py: 0, minHeight: 30}} label={t('panel')} value="panel"/>
                                <Tab sx={{py: 0, minHeight: 30}} label={t('io')} value="io"/>
                                <Tab sx={{py: 0, minHeight: 30}} label={t('by_name')} value="byname"/>
                            </Tabs>

                            {controlTab === 'panel' && (
                                <FC scroll="y-auto"><MacrosWirelessDashboard/></FC>
                            )}

                            {controlTab === 'io' && (
                                <FC scroll="y-auto" pb={1.7} g={1} mx="auto">
                                    <ScreenViewerProvider>
                                        <FCCC><ScreenViewer style={{width: '100%'}}/></FCCC>
                                    </ScreenViewerProvider>
                                    <RemoteTouchpad/>
                                    <RemoteMouse/>
                                    <RemoteKeyboardField/>
                                </FC>
                            )}

                            {controlTab === 'byname' && (
                                <FC>
                                    <p style={{color: plt.text.primary + 'aa', marginBottom: '.3rem'}}>
                                        {t('enter_macro_hint')}
                                    </p>
                                    <MacrosExecutorForm/>
                                </FC>
                            )}
                        </>
                    )}

                    {mainTab === 'info' && (
                        <MacrosInfo/>
                    )}
                </FC>
            </MacroControlProvider>
        </Collapse>
    );
};

export default MacrosExecutorPage;
