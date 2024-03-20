import React from 'react';
import {useNavigate} from 'react-router-dom';
import {Button, Container, Link, Typography} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import TelegramIcon from '@mui/icons-material/Telegram';
import Head from "../components/base/Head";

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
                Contact Us
            </Typography>
            <div className={'fc w-min mx-auto'}>
                <Link className={'frsc gap-2 text-decoration-none'} rel={'noopener noreferrer'} target={'_blank'}
                      href="mailto:ivanhvalevskey@gmail.com" color="inherit">
                    <EmailIcon fontSize="large"/>
                    <Typography className={'enable-tap-select-all'}>ivanhvalevskey@gmail.com</Typography>
                </Link>
                <Link className={'frsc gap-2 text-decoration-none'} rel={'noopener noreferrer'}
                      href="https://t.me/artasov/" target={'_blank'}
                      color="inherit">
                    <TelegramIcon fontSize="large"/>
                    <Typography className={'enable-tap-select-all'}>@artasov</Typography>
                </Link>
            </div>
            <Typography variant="h6" gutterBottom style={{marginTop: '20px'}}>
                Explore Our Software
            </Typography>
            <div className={'frcc flex-wrap gap-2'}>
                <Button variant="outlined" onClick={() => navigate('/software')}>
                    Our Software
                </Button>
                <Button variant="outlined" onClick={() => navigate('/terms-and-conditions')}>
                    Terms & Conditions
                </Button>
                <Button variant="outlined" onClick={() => navigate('/privacy-policy')}>
                    Privacy Policy
                </Button>
            </div>
        </Container>
    );
};

export default About;
