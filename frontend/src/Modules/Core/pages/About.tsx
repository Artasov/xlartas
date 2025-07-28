// Modules/Core/pages/About.tsx
import React from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'Utils/nextRouter';
import {Button, Container, Link, Typography} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import TelegramIcon from '@mui/icons-material/Telegram';
// @ts-ignore
import tinkoffFullEn from '../../../Static/img/icon/tbank/long_dark_logo.svg';
import Head from "Core/components/Head";

const About = () => {
    const navigate = useNavigate();
    const {t} = useTranslation();

    return (
        <Container maxWidth="md" style={{marginTop: '20px', maxWidth: 500, textAlign: 'center'}}>
            <Head title={'xl | About'}/>
            <Typography variant="h4" component="h1" gutterBottom>
                {t('about_us_title')}
            </Typography>
            <Typography component="p" sx={{mb: 2}}>
                {t('about_us_description')}
            </Typography>
            <Typography variant="h6" gutterBottom>
                {t('contacts')}
            </Typography>
            <div className={'fcs w-min mx-auto'}>
                <Link className={'frsc gap-2 text-decoration-none'} rel={'noopener noreferrer'} target={'_blank'}
                      href="mailto:ivanhvalevskey@gmail.com" color="inherit">
                    <EmailIcon fontSize="large"/>
                    <Typography className={'enable-tap-select-all'}>ivanhvalevskey@gmail.com</Typography>
                </Link>
                <Link className={'frsc gap-2 text-decoration-none mb-2'} rel={'noopener noreferrer'}
                      href="https://t.me/artasov/" target={'_blank'}
                      color="inherit">
                    <TelegramIcon fontSize="large"/>
                    <Typography className={'enable-tap-select-all'}>@artasov</Typography>
                </Link>
                <Typography className={'text-left text-nowrap'}>
                    ИП: <span className={'enable-tap-select-all'}>Толпегин Никита Дмитриевич</span>
                </Typography>
                <Typography className={'text-left'}>Tel: <span
                    className={'enable-tap-select-all'}>+7 911 166 56 21</span></Typography>
                <Typography className={'text-left'}>ИНН: <span
                    className={'enable-tap-select-all'}>690808422511</span></Typography>
                <Typography className={'text-left'}>ОГРН: <span
                    className={'enable-tap-select-all'}>324690000014056</span></Typography>
            </div>
            <Typography variant="h6" gutterBottom style={{marginTop: '20px'}}>
                {t('user_information')}
            </Typography>
            <div className={'frcc flex-wrap gap-2'}>
                <Button variant="outlined" onClick={() => navigate('/offer')}>
                    {t('offer')}
                </Button>
                <Button variant="outlined" onClick={() => navigate('/terms-and-conditions')}>
                    {t('terms_and_conditions')}
                </Button>
                <Button variant="outlined" onClick={() => navigate('/privacy-policy')}>
                    {t('privacy_policy')}
                </Button>
                <Button variant="outlined" onClick={() => navigate('/software')}>
                    {t('our_software')}
                </Button>
            </div>
            <div className={'mt-3 fs-5 frcc gap-2'}>
                <span>{t('payment_system')}</span>
                <img style={{height: '1.9em'}} src={tinkoffFullEn} alt={'Tinkoff'}/>
            </div>
        </Container>
    );
};

export default About;
