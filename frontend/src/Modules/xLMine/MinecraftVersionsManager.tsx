// Modules/xLMine/MinecraftVersionsManager.tsx
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Tab, Tabs} from '@mui/material';
import Collapse from '@mui/material/Collapse';
import {FC} from "wide-containers";
import LauncherManager from "./LauncherManager";
import ReleaseManager from "./ReleaseManager";



const MinecraftVersionsManager: React.FC = () => {
    const [tabIndex, setTabIndex] = useState<number>(0);
    const [animate, setAnimate] = useState(false);
    const {t} = useTranslation();

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    useEffect(() => setAnimate(true), []);

    return (
        <Collapse in={animate} appear timeout={400}>
            <FC>
                <Tabs value={tabIndex} onChange={handleTabChange}>
                    <Tab label="Launcher"/>
                    <Tab label="Release"/>
                </Tabs>
                <FC>
                    {tabIndex === 0 && <LauncherManager/>}
                    {tabIndex === 1 && <ReleaseManager/>}
                </FC>
            </FC>
        </Collapse>
    );
};

export default MinecraftVersionsManager;
