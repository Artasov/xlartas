// Modules/xLMine/Donate/DonateModal.tsx
import React, {useContext, useEffect, useState} from "react";
import {useTranslation} from 'react-i18next';
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Tooltip from "@mui/material/Tooltip";
import {Button, Slider} from "@mui/material";
import {AuthContext, AuthContextType} from "Auth/AuthContext";
import {useApi} from "Modules/Api/useApi";
import {Message} from "Core/components/Message";
import CircularProgress from "Core/components/elements/CircularProgress";
import {FC, FCSC, FR, FRBC, FRSC} from "wide-containers";
import {useErrorProcessing} from "Core/components/ErrorProvider";
import {IDonate} from "./types";
import PrivilegesView from "../Privilege/PrivilegesView";

const MIN_COINS = 10;
const MAX_COINS = 10000;

interface IDonateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    borderRadius: '8px',
    boxShadow: 24,
    p: 4,
};

const DonateModal: React.FC<IDonateModalProps> = ({isOpen, onClose}) => {
    const [coins, setCoins] = useState<number>(100);
    const [donateProduct, setDonate] = useState<IDonate | null>(null);
    const [price, setPrice] = useState<number>(1); // цена «1 руб. за 1 коин» — по умолчанию
    const [loading, setLoading] = useState<boolean>(false);

    const {isAuthenticated} = useContext(AuthContext) as AuthContextType;
    const {api} = useApi();
    const {notAuthentication} = useErrorProcessing();
    const {t} = useTranslation();

    // При открытии модального окна — сбрасываем стейт, грузим последний Donate
    useEffect(() => {
        if (!isOpen) return;
        setCoins(MIN_COINS);
        setDonate(null);
        setPrice(1);
        api
            .get("/api/v1/xlmine/donate/product/latest/")
            .then((data) => {
                setDonate(data);
                // Берём price из product.prices[0].amount
                if (data.prices && data.prices.length > 0) {
                    const newPrice = parseFloat(data.prices[0].amount);
                    if (!Number.isNaN(newPrice)) setPrice(newPrice);
                }
            })
            .catch((_error) => null);
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
            Message.error(t('donate_not_loaded'));
            return;
        }
        setLoading(true);
        const finalCost = coins * price;
        const payload = {
            product: donateProduct.id,
            currency: "RUB",
            payment_system: "handmade",
            coins_amount: coins,
            amount: finalCost,
        };
        api
            .post("/api/v1/orders/create/", payload)
            .then((_data) => {
                Message.success(t('donate_coins_created_success'), 2, 5000);
                onClose();
            })
            .catch((_error) => null)
            .finally(() => setLoading(false));
    };

    const totalPrice = coins * price;

    return (
        <Modal
            open={isOpen}
            onClose={handleClose}
            aria-labelledby="donate-modal-title"
            aria-describedby="donate-modal-description"
        >
            <Box sx={modalStyle}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                    }}
                >
                    <Typography id="donate-modal-title" variant="h6" component="h2">
                        Покупка коинов
                    </Typography>
                    <IconButton onClick={handleClose}>
                        <CloseIcon/>
                    </IconButton>
                </Box>
                <FC g={2} px={2}>
                    <FCSC>
                        {!donateProduct ? (
                            <CircularProgress size="40px"/>
                        ) : (
                            <>
                                <FR maxW={250} pr={3}>
                                    <PrivilegesView/>
                                </FR>
                                <FRSC w={"100%"}>
                                    <FR w={"100%"} pl={1}>
                                        <Slider
                                            value={coins}
                                            onChange={(_, v) => setCoins(v as number)}
                                            min={MIN_COINS}
                                            max={MAX_COINS}
                                            step={1}
                                            valueLabelDisplay="auto"
                                            sx={{flexGrow: 1}}
                                            disabled={loading}
                                        />
                                    </FR>
                                </FRSC>
                                <p style={{fontWeight: "bold"}}>
                                    Итого к оплате: {totalPrice} руб.
                                </p>
                            </>
                        )}
                    </FCSC>
                    <FRBC g={1}>
                        <Tooltip title={`Цена за 1 коин: ${price} руб.`} arrow>
                            <div>
                                <Button
                                    onClick={handleBuy}
                                    fullWidth
                                    loading={loading}
                                    disabled={loading || !donateProduct}
                                >
                                    Купить за {totalPrice} руб.
                                </Button>
                            </div>
                        </Tooltip>
                    </FRBC>
                </FC>
            </Box>
        </Modal>
    );
};

export default DonateModal;
