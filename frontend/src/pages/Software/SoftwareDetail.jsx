import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import axios from 'axios';
import SoftwareProduct from "./SoftwareProductCard";
import {CircularProgress} from "@mui/material";

const SoftwareDetail = () => {
    const {softwareName} = useParams();
    const [software, setSoftware] = useState(null);

    useEffect(() => {
        axios.get(`/api/software/${softwareName}`)
            .then(response => {
                setSoftware(response.data);
            })
            .catch(error => {
                setSoftware(false)
                console.error('Error fetching software details:', error);
            });
    }, [softwareName]);

    if (software === null)
        return (
            <div className="fcsc mt-5">
                <CircularProgress size={100}/>
            </div>
        );

    return (
        <div className={'mt-4'} style={{maxWidth: 400, margin: 'auto'}}>
            <div className={'w-90 mx-auto frc flex-wrap gap-2'}>
                <SoftwareProduct software={software}/>
            </div>
        </div>
    );
};
export default SoftwareDetail;