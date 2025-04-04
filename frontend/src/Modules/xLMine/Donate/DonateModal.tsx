import React, {useContext, useEffect, useState} from "react";
import {Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Slider} from "@mui/material";
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import {AuthContext, AuthContextType} from "Auth/AuthContext";
import {useApi} from "Modules/Api/useApi";
import {Message} from "Core/components/Message";
import CircularProgress from "Core/components/elements/CircularProgress";
import Button from "Core/components/elements/Button/Button";
import {FCSC, FR, FRSC} from "WideLayout/Layouts";
import {useErrorProcessing} from "Core/components/ErrorProvider";
import {IDonate} from "./types";
import PrivilegesView from "../Privilege/PrivilegesView";

interface IDonateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const MIN_COINS = 10;
const MAX_COINS = 10000;


const DonateModal: React.FC<IDonateModalProps> = ({isOpen, onClose}) => {
    const [coins, setCoins] = useState<number>(100);
    const [donateProduct, setDonate] = useState<IDonate | null>(null);
    const [price, setPrice] = useState<number>(1); // цена «1 руб. за 1 коин» — по умолчанию
    const [loading, setLoading] = useState<boolean>(false);

    const {isAuthenticated, user} = useContext(AuthContext) as AuthContextType;
    const {api} = useApi();
    const {notAuthentication} = useErrorProcessing();

    // При открытии модалки — сбрасываем стейт, грузим последний Donate
    useEffect(() => {
        if (!isOpen) return;
        setCoins(MIN_COINS);
        setDonate(null);
        setPrice(1);
        api.get('/api/v1/xlmine/donate/product/latest/').then(data => {
            setDonate(data);
            // Берём price из product.prices[0].amount
            if (data.prices && data.prices.length > 0) {
                const newPrice = parseFloat(data.prices[0].amount);
                if (!Number.isNaN(newPrice)) setPrice(newPrice);
            }
        }).catch(_ => null);
    }, [isOpen, api]);

    const handleClose = () => {
        if (!loading) onClose();
    };

    const handleBuy = () => {
        if (!isAuthenticated) {
            // Пользователь не авторизован => вызовем попап авторизации
            notAuthentication();
            onClose();
            return;
        }
        if (!donateProduct) {
            Message.error('Donate не загружен');
            return;
        }
        setLoading(true);
        const finalCost = coins * price;
        const payload = {
            product: donateProduct.id,
            currency: "RUB",
            payment_system: "handmade",
            coins_amount: coins,
            amount: finalCost
        };
        api.post('/api/v1/orders/create/', payload).then(_ => {
            Message.success('Заказ на покупку коинов успешно создан', 2, 5000);
            onClose();
        }).catch(_ => null).finally(() => setLoading(false));
    };

    const totalPrice = coins * price;

    return (
        <Dialog open={isOpen} onClose={handleClose} maxWidth="xs" fullWidth>
            <DialogTitle className="frsc">
                Покупка коинов
                <IconButton sx={{ml: 'auto'}} onClick={handleClose} disabled={loading}>
                    <CloseRoundedIcon/>
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <FCSC>
                    {!donateProduct ? (
                        <CircularProgress size="40px"/>
                    ) : (
                        <>
                            <FR maxW={250}><PrivilegesView/></FR>
                            <span>Количество коинов</span>
                            <FRSC w={'100%'}>
                                <Slider
                                    value={coins}
                                    onChange={(_, v) => setCoins(v as number)}
                                    min={MIN_COINS} max={MAX_COINS}
                                    step={1} valueLabelDisplay="auto"
                                    sx={{flexGrow: 1}} disabled={loading}
                                />
                                <span style={{width: '3rem', textAlign: 'center'}}>
                                    {coins}
                                </span>
                            </FRSC>

                            <p>Цена за 1 коин: {price} руб.</p>
                            <p style={{fontWeight: 'bold'}}>
                                Итого к оплате: {totalPrice} руб.
                            </p>
                        </>
                    )}
                </FCSC>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} disabled={loading}>
                    Отмена
                </Button>
                <Button onClick={handleBuy} loading={loading} disabled={loading || !donateProduct}>
                    Купить
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DonateModal;
