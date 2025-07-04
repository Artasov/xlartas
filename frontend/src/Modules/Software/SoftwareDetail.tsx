// Modules/Software/SoftwareDetail.tsx
import React, {memo, useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate, useParams} from 'react-router-dom';
import CircularProgress from "Core/components/elements/CircularProgress";
import {Button, IconButton} from "@mui/material";
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import YouTubeIcon from '@mui/icons-material/YouTube';
import {FC, FCCC, FR, FRCC, FRSE} from "wide-containers";
import {useTheme} from "Theme/ThemeContext";
import SoftwareOrder from './SoftwareOrder';
import {ISoftware} from "./Types/Software";
import {AuthContext, AuthContextType} from "Auth/AuthContext";
import {useApi} from "../Api/useApi";
import {Message} from "Core/components/Message";
import SoftwareTestPeriodButton from "./SoftwareTestPeriodButton";
import FeedRoundedIcon from '@mui/icons-material/FeedRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from "@mui/material/useMediaQuery";

const SoftwareDetailComponent: React.FC = () => {
    const {id} = useParams();
    const {isAuthenticated} = useContext(AuthContext) as AuthContextType;
    const {plt} = useTheme();
    const {api} = useApi();
    const navigate = useNavigate();
    const {t} = useTranslation();

    const [software, setSoftware] = useState<ISoftware | null>(null);
    const [loading, setLoading] = useState(true);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    // Новые состояния для лицензии
    const [licenseHours, setLicenseHours] = useState<number | null>(null);
    const [licenseLoading, setLicenseLoading] = useState(false);
    const [isTested, setIsTested] = useState<boolean | null>(null);

    const isGt576 = useMediaQuery('(min-width:576px)');
    useEffect(() => {
        if (!id) {
            Message.error(t('software_id_not_provided'));
            setLoading(false);
            return;
        }
        setLoading(true);
        api.get(`/api/v1/software/${id}/`)
            .then(data => setSoftware(data))
            .catch(() => Message.error(t('software_load_error')))
            .finally(() => setLoading(false));
    }, [id]);

    // Запрос лицензии
    useEffect(() => {
        if (isAuthenticated && software) {
            setLicenseLoading(true);
            api.get(`/api/v1/license/${software.id}/`).then(data => {
                if (data.no_one) {
                    setLicenseHours(0);
                    setIsTested(false);
                    return;
                }
                setLicenseHours(data.remaining_hours);
                setIsTested(data.is_tested);
            }).catch(_ => null).finally(() => setLicenseLoading(false));
        }
    }, [isAuthenticated, software]);

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
                    {isTested === null && licenseLoading
                        ? <CircularProgress size="20px"/>
                        : isTested
                            ? <FR lh={'1rem'}>{t('hours_left', {hours: licenseHours !== null ? licenseHours : 0})}</FR>
                            : ''
                    }
                </FR>
            )}
            {isTested !== null && ((licenseHours !== null && licenseHours < 1) || !isAuthenticated) && (
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
            <FC px={isGt576 ? 3 : 1} pt={2.1}>
                <FRSE wrap g={'.1rem'} mb={2}>
                    <FR g={.3}>
                        <h1 style={{
                            lineHeight: '1.6rem',
                            fontSize: '1.8rem',
                            margin: 0,
                        }}>{software.name}</h1>
                        {software.file && <span style={{
                            color: plt.text.primary,
                            fontSize: '.8rem',
                            lineHeight: '.9rem',
                            marginTop: 'auto',
                        }}>v.{software.file.version}</span>}
                    </FR>
                    <FR g={'.1rem'} ml={'auto'}>
                        {software.log_changes && (
                            <IconButton sx={{mr: .44}} onClick={() => setIsLogModalOpen(true)}>
                                <HistoryRoundedIcon sx={{color: plt.text.primary}}/>
                            </IconButton>
                        )}
                        {software.guide_url && (
                            <IconButton onClick={() => window.open(software.guide_url, '_blank')}>
                                <FeedRoundedIcon sx={{color: plt.text.primary}}/>
                            </IconButton>
                        )}
                        {software.file?.file && (
                            <IconButton onClick={() => window.open(software.file?.file, '_blank')}>
                                <DownloadRoundedIcon sx={{color: plt.text.primary}}/>
                            </IconButton>
                        )}
                        {software.review_url &&
                            <a style={{color: plt.text.primary, marginLeft: '.3rem'}}
                               href={software.review_url}
                               className={'tdn'}
                               target="_blank" rel="noreferrer">
                                <Button size={'small'} sx={{
                                    paddingY: '.11rem'
                                }} className={'gap-1 fw-bold'}><YouTubeIcon/><span>{t('review')}</span></Button>
                            </a>
                        }</FR>
                </FRSE>

                <SoftwareOrder software={software} onSuccess={(data: any) => {
                    navigate(`/orders/${data.id}/?pay=1`)
                }}/>

                {software.description &&
                    <FR mt={.3}>
                        <p style={{whiteSpace: 'pre-wrap'}}>
                            {software.description}
                        </p>
                    </FR>
                }
            </FC>
            {/* Модальное окно для отображения логов изменений */}
            <Dialog open={isLogModalOpen} onClose={() => setIsLogModalOpen(false)}>
                <DialogTitle>Лог изменений</DialogTitle>
                <DialogContent sx={{maxWidth: 500}} className={'no-scrollbar'}>
                    <FCCC pos={'relative'}>
                        <div style={{
                            textShadow: '0 0 5px ' + plt.background.primary + '88'
                        }} dangerouslySetInnerHTML={{__html: software.log_changes}}/>
                    </FCCC>
                </DialogContent>
            </Dialog>
        </FC>
    );
};

export default memo(SoftwareDetailComponent);
