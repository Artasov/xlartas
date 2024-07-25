import React from 'react';
import {useNavigate} from 'react-router-dom';
import {Button, Container, Link, Typography} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import TelegramIcon from '@mui/icons-material/Telegram';
import tinkoffFullEn from '../static/img/icons/tinkoff/tinkoff_full_en.svg';
import Head from "../components/Head";

const About = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="md" style={{marginTop: '20px', maxWidth: 500, textAlign: 'center'}}>
            <Head title={'xl | About'}/>
            <Typography variant="h4" component="h1" gutterBottom>
                About Us
            </Typography>
            <Typography paragraph>
                We specialize in backend development and WinAPI software solutions, crafting advanced systems with high
                performance and reliability.
            </Typography>
            <Typography variant="h6" gutterBottom>
                Контакты
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
                Пользовательская информация
            </Typography>
            <div className={'frcc flex-wrap gap-2'}>
                <Button variant="outlined" onClick={() => navigate('/offer')}>
                    Оферта
                </Button>
                <Button variant="outlined" onClick={() => navigate('/terms-and-conditions')}>
                    Условия использования
                </Button>
                <Button variant="outlined" onClick={() => navigate('/privacy-policy')}>
                    Политика конфиденциальности
                </Button>
                <Button variant="outlined" onClick={() => navigate('/software')}>
                    Our Software
                </Button>
            </div>
            <div className={'mt-3 fs-5 frcc gap-2'}>
                <span>PAYMENT SYSTEM</span>
                <img style={{height: '1.9em'}} src={tinkoffFullEn} alt={'Tinkoff'}/>
            </div>
        </Container>
    );
};

export default About;
