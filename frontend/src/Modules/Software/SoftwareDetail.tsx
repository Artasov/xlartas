// xl/frontend/src/Modules/Software/SoftwareDetail.tsx
import React, {memo, useContext, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import CircularProgress from "Core/components/elements/CircularProgress";
import {IconButton} from "@mui/material";
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import YouTubeIcon from '@mui/icons-material/YouTube';
import Button from "Core/components/elements/Button/Button";
import {FC, FR, FRCC, FRSE} from "WideLayout/Layouts";
import {useTheme} from "Theme/ThemeContext";
import SoftwareOrder from './SoftwareOrder';
import {ISoftware} from "./Types/Software";
import {AuthContext, AuthContextType} from "Auth/AuthContext";
import {useApi} from "../Api/useApi";
import {Message} from "Core/components/Message";
import SoftwareTestPeriodButton from "./SoftwareTestPeriodButton";
import FeedRoundedIcon from '@mui/icons-material/FeedRounded';

const SoftwareDetailComponent: React.FC = () => {
    const {id} = useParams();
    const {isAuthenticated} = useContext(AuthContext) as AuthContextType;
    const {theme} = useTheme();
    const {api} = useApi();
    const navigate = useNavigate();

    const [software, setSoftware] = useState<ISoftware | null>(null);
    const [loading, setLoading] = useState(true);

    // Новые состояния для лицензии
    const [licenseHours, setLicenseHours] = useState<number | null>(null);
    const [licenseLoading, setLicenseLoading] = useState(false);
    const [isTested, setIsTested] = useState<boolean>(false);

    useEffect(() => {
        if (!id) {
            Message.error('Не указан software ID');
            setLoading(false);
            return;
        }
        setLoading(true);
        api.get(`/api/v1/software/${id}/`)
            .then(data => setSoftware(data))
            .catch(() => Message.error('Ошибка загрузки Software'))
            .finally(() => setLoading(false));
    }, [id, api]);

    // Запрос лицензии зависит только от software и isAuthenticated
    useEffect(() => {
        if (isAuthenticated && software) {
            setLicenseLoading(true);
            api.get(`/api/v1/license/${software.id}/`).then(data => {
                setLicenseHours(data.remaining_hours);
                setIsTested(data.is_tested);
            }).catch(_ => null).finally(() => setLicenseLoading(false));
        }
    }, [isAuthenticated, software, api]);

    const refreshLicense = () => {
        if (isAuthenticated && software) {
            setLicenseLoading(true);
            api.get(`/api/v1/license/${software.id}/`).then(data => {
                setLicenseHours(data.remaining_hours);
                setIsTested(data.is_tested);
            }).catch(_ => null).finally(() => setLicenseLoading(false));
        }
    };

    if (loading) return <FRCC h="70vh"><CircularProgress size="80px"/></FRCC>;
    if (!software) return <FRCC h="70vh">Software не найдено</FRCC>;

    return (
        <FC pos={'relative'}>
            {isAuthenticated && (
                <FR p={1} pos={'absolute'} top={0} left={0}>
                    {licenseLoading
                        ? <CircularProgress size="20px"/>
                        : <FR lh={'1rem'}>{licenseHours !== null ? licenseHours : 0} hours left</FR>
                    }
                </FR>
            )}
            {((licenseHours !== null && licenseHours < 1) || !isAuthenticated) && (
                <FR p={1} pos={'absolute'} top={0} left={0}>
                    <SoftwareTestPeriodButton
                        softwareId={software.id}
                        testPeriodDays={software.test_period_days}
                        isTested={isTested}
                        refreshLicense={refreshLicense}
                    />
                </FR>
            )}
            <img src={software.pic} className={'rounded-top-3'} style={{
                maxHeight: 190, objectFit: 'cover', maxWidth: '100%'
            }} alt="software"/>
            <FC px={3} pt={2.1}>
                <FRSE g={'.1rem'} mb={2}>
                    <h1 style={{
                        lineHeight: '1.6rem',
                        fontSize: '1.8rem',
                        margin: 0,
                    }}>{software.name}</h1>
                    {software.file && <span style={{
                        color: theme.palette.text.primary30,
                        fontSize: '.8rem',
                        lineHeight: '.9rem'
                    }}>v.{software.file.version}</span>}
                    {software.guide_url && (
                        <IconButton className={'ms-auto me-2'}
                                    onClick={() => window.open(software.guide_url, '_blank')} color="primary">
                            <FeedRoundedIcon sx={{color: theme.palette.text.primary80}}/>
                        </IconButton>
                    )}
                    {software.file?.file && (
                        <IconButton onClick={() => window.open(software.file?.file, '_blank')} color="primary">
                            <DownloadRoundedIcon sx={{color: theme.palette.text.primary80}}/>
                        </IconButton>
                    )}
                    {software.review_url &&
                        <a style={{color: theme.palette.text.primary70}} href={software.review_url}
                           className={'tdn'}
                           target="_blank" rel="noreferrer">
                            <Button size={'small'} sx={{
                                paddingY: '.11rem'
                            }} className={'gap-1 fw-bold'}><YouTubeIcon/><span>Review</span></Button>
                        </a>
                    }
                </FRSE>

                <SoftwareOrder software={software} onSuccess={(data: any) => {
                    navigate(`/orders/${data.id}`)
                }}/>

                {software.description &&
                    <FR mt={.3}>
                        <p style={{whiteSpace: 'pre-wrap'}}>
                            {software.description}
                        </p>
                    </FR>
                }
            </FC>
        </FC>
    );
};

export default memo(SoftwareDetailComponent);
