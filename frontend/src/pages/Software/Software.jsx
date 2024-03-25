import React, {useEffect, useState} from 'react';
import {CircularProgress} from '@mui/material';
import axios from "axios";
import SoftwareProduct from './SoftwareProductCard';
import {useAuth} from "../../components/base/auth/useAuth";
import Head from "../../components/base/Head";

const Software = () => {
    const {isAuthenticated, user} = useAuth();
    const [softwares, setSoftwares] = useState(null);
    const [loadingSoftwares, setLoadingSoftwares] = useState(true);
    const [errorSoftwares, setErrorSoftwares] = useState('');

    useEffect(() => {
        axios.get('/api/software/')
            .then(response => {
                console.log(response.data)
                setSoftwares(response.data);
                setLoadingSoftwares(false);
            })
            .catch(error => {
                console.error('Error fetching products:', error);
                setErrorSoftwares('Failed to load products');
                setLoadingSoftwares(false);
            });
    }, []);

    if (loadingSoftwares) return (<div className="fcsc mt-5">
        <CircularProgress size={100}/>
    </div>);

    if (errorSoftwares) return <div style={{textAlign: 'center'}}>{errorSoftwares}</div>;

    return (<div className={'mt-4'} style={{maxWidth: 400, margin: 'auto'}}>
        <Head title={'xl | Software'}/>
        <div className={'w-90 mx-auto frc flex-wrap gap-2'}>
            {softwares && softwares.map((software, index) => (<SoftwareProduct key={index} software={software}/>))}
        </div>
    </div>);
};

export default Software;
