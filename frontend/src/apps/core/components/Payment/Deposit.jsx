import React, {useState} from 'react';
import {AuthContext} from "../auth/AuthContext";
import axiosInstance, {YANDEX_RECAPTCHA_SITE_KEY} from "../auth/axiosConfig";
import DynamicForm from "../elements/DynamicForm";
import TextField from "@mui/material/TextField";
import {Message} from "../Message";
import {useAuth} from "../auth/useAuth";
import PaymentForm from "./PaymentForm";
import {SmartCaptcha} from "@yandex/smart-captcha";
import {ErrorProcessing} from "../ErrorProcessing";
import {useStyles} from "../Theme/useStyles";

const Deposit = ({className}) => {
    const {isAuthenticated, showLoginModal, frontendLogout} = useAuth(AuthContext);
    const [amount, setAmount] = useState([]);
    const [orderId, setOrderId] = useState(null);
    const [captchaToken, setCaptchaToken] = useState(null);
    const [resetCaptcha, setResetCaptcha] = useState(0);
    const classes = useStyles();

    const handleResetCaptcha = () => {
        setResetCaptcha((prev) => prev + 1);
        setCaptchaToken(null);
    };
    const createDepositOrder = () => {
        if (!isAuthenticated) {
            ErrorProcessing.notAuthentication(showLoginModal)
            handleResetCaptcha();
            return;
        }
        if (captchaToken === null) {
            Message.error('Please complete the captcha');
            handleResetCaptcha();
            return;
        }
        if (amount < 150) {
            Message.error('Minimum deposit amount 150 RUB');
            handleResetCaptcha();
            return;
        }
        axiosInstance.post('/pay/deposit/', {
            amount: parseFloat(amount)
        }).then(response => {
            if (response.data.order_id) {
                setOrderId(response.data.order_id);
            }
        }).catch(error => {
            ErrorProcessing.byResponse(error, frontendLogout);
            handleResetCaptcha();
        });
    }

    return (
        <div className={'mx-auto'}>
            {orderId
                ?
                <PaymentForm orderId={orderId} amount={amount}/>
                :
                <DynamicForm className={className}
                             requestFunc={createDepositOrder}
                             loadingClassName={`${classes.textPrimary80} ${classes.bgPrimary30}`}
                             submitBtnClassName={`${classes.bgContrast80} ${classes.textContrast80} 
                                          fw-7 w-min text-nowrap mx-auto`}
                             submitBtnText={'DEPOSIT'}>
                    <TextField
                        label="Amount"
                        variant="outlined"
                        type="number" // изменено с text на number
                        helperText="Deposit amount (RUB currency)"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        fullWidth
                        margin="dense"
                    />
                    <SmartCaptcha sitekey={YANDEX_RECAPTCHA_SITE_KEY}
                                  key={resetCaptcha} onSuccess={setCaptchaToken}/>
                    <span className={'mb-1'}></span>
                </DynamicForm>
            }
        </div>
    );
};

export default Deposit;