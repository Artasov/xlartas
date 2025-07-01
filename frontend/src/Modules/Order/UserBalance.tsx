import React, {useEffect, useState} from 'react';
import BalanceTopUpDialog from './BalanceTopUpDialog';
import {useApi} from '../Api/useApi';
import {FR, FRSC} from "wide-containers";
import {Button} from "@mui/material";

const UserBalance: React.FC = () => {
    const {api} = useApi();
    const [balance, setBalance] = useState<number>(0);
    const [open, setOpen] = useState(false);

    const fetchBalance = () => {
        api.get('/api/v1/user/balance/').then((d: any) => {
            setBalance(parseFloat(d.balance));
        }).catch(() => null);
    };

    useEffect(() => {
        fetchBalance();
    }, []);

    return (
        <FRSC g={1} wrap>
            <FR fontWeight={'bold'} fontSize={'1.2rem'}>Баланс: {balance}₽</FR>
            <Button size="small" onClick={() => setOpen(true)} sx={{fontWeight: 'bold'}}>Пополнить баланс</Button>
            <BalanceTopUpDialog open={open} onClose={() => {
                setOpen(false);
                fetchBalance();
            }}/>
        </FRSC>
    );
};

export default UserBalance;