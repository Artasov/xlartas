import React, {useEffect, useState} from 'react';
import BalanceTopUpDialog from './BalanceTopUpDialog';
import {useApi} from '../Api/useApi';
import {FR} from "wide-containers";
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
        <FR g={1} wrap>
            <span>Баланс: {balance} ₽</span>
            <Button size="small" onClick={() => setOpen(true)}>Пополнить баланс</Button>
            <BalanceTopUpDialog open={open} onClose={() => {
                setOpen(false);
                fetchBalance();
            }}/>
        </FR>
    );
};

export default UserBalance;