// Modules/Auth/Social/elements/UserBalance.tsx
import React, {useEffect, useState} from 'react';
import BalanceTopUpDialog from './BalanceTopUpDialog';
import {useApi} from 'Api/useApi';
import {FR, FRSC} from 'wide-containers';
import {Button} from '@mui/material';
import Zoom from '@mui/material/Zoom';
import {useTranslation} from 'react-i18next';
import CircularProgressZoomify from "Core/components/elements/CircularProgressZoomify";

const UserBalance: React.FC = () => {
    const {api} = useApi();
    const {t} = useTranslation();
    const [balance, setBalance] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [open, setOpen] = useState(false);

    const fetchBalance = () => {
        setLoading(true);
        api.get('/api/v1/user/balance/')
            .then((d: any) => setBalance(parseFloat(d.balance)))
            .catch(() => null)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchBalance();
    }, []);

    return (
        <FRSC g={1} wrap>
            <FR fontWeight="bold" fontSize="1.2rem">
                {t('balance')}:&nbsp;&nbsp;&nbsp;
                <FR pos={'relative'} minW={24} h={'100%'}>
                    <FR pos={'absolute'} top={0} right={4}>
                        <FR pos={'relative'} h={'100%'} w={24} mt={.4}>
                            <CircularProgressZoomify in={loading} size={24}/>
                        </FR>
                    </FR>
                    <FR pos={'absolute'} top={0} right={0}>
                        <Zoom in={!loading} mountOnEnter unmountOnExit timeout={{enter: 1000, exit: 1100}}>
                            <span>{balance}₽</span>
                        </Zoom>
                    </FR>
                </FR>
            </FR>
            <Button size="small" onClick={() => setOpen(true)} sx={{fontWeight: 'bold'}}>
                {t('top_up_balance')}
            </Button>
            <BalanceTopUpDialog
                open={open}
                onClose={() => {
                    setOpen(false);
                    fetchBalance();
                }}
            />
        </FRSC>
    );
};

export default UserBalance;
