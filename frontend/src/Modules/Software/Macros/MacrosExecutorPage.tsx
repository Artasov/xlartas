import React, {useState} from 'react';
import {Tab, Tabs, useMediaQuery} from '@mui/material';
import {FC} from 'wide-containers';
import {useTheme} from 'Theme/ThemeContext';
import {MacroControlProvider} from './MacroControlProvider';
import MacrosWirelessDashboard from './MacrosWirelessDashboard';
import RemoteTouchpad from './RemoteTouchpad';
import RemoteKeyboardField from './RemoteKeyboardField';
import RemoteMouse from './RemoteMouse';
import MacrosExecutorForm from './MacrosExecutorForm';
import LanguageSwitcher from "../../../UI/LanguageSwitcher";
import MacrosInfo from "./MacrosInfo";

const MacrosExecutorPage: React.FC = () => {
    const {plt} = useTheme();
    const [mainTab, setMainTab] = useState<'control' | 'info'>('control');
    const [controlTab, setControlTab] =
        useState<'panel' | 'io' | 'byname'>('panel');
    const isGtSm = useMediaQuery('(min-width: 576px)');
    const [lang, setLang] = useState<'en' | 'ru'>('en')

    return (
        <MacroControlProvider>
            <FC w="100%" scroll="y-hidden" px={2} pt={isGtSm ? 2 : 0} g={1}>
                <Tabs
                    value={mainTab}
                    onChange={(_, v) => setMainTab(v)}
                    centered
                    sx={{minHeight: 30}}
                >
                    <Tab sx={{py: 0, minHeight: 30}} label="Control" value="control"/>
                    <Tab sx={{py: 0, minHeight: 30}} label="Info" value="info"/>
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
                            <Tab sx={{py: 0, minHeight: 30}} label="Panel" value="panel"/>
                            <Tab sx={{py: 0, minHeight: 30}} label="I/O" value="io"/>
                            <Tab sx={{py: 0, minHeight: 30}} label="By Name" value="byname"/>
                        </Tabs>

                        {controlTab === 'panel' && (
                            <FC scroll="y-auto"><MacrosWirelessDashboard/></FC>
                        )}

                        {controlTab === 'io' && (
                            <FC scroll="y-auto" pb={1.7} g={1} mx="auto">
                                <RemoteTouchpad/>
                                <RemoteMouse/>
                                <RemoteKeyboardField/>
                            </FC>
                        )}

                        {controlTab === 'byname' && (
                            <FC>
                                <p style={{color: plt.text.primary + 'aa', marginBottom: '.3rem'}}>
                                    Enter the name of the macros (as in the application) and click
                                    "Execute"
                                </p>
                                <MacrosExecutorForm/>
                            </FC>
                        )}
                    </>
                )}

                {mainTab === 'info' && (<>
                    <LanguageSwitcher lang={lang} onChange={setLang}/>
                    <MacrosInfo lang={lang}/>
                </>)}
            </FC>
        </MacroControlProvider>
    );
};

export default MacrosExecutorPage;
