import React, {useState} from 'react';
import {AuthContext} from "../auth/AuthContext/AuthContext";
import axiosInstance, {YANDEX_RECAPTCHA_SITE_KEY} from "../../../services/base/axiosConfig";
import DynamicForm from "../elements/DynamicForm";
import TextField from "@mui/material/TextField";
import {Message} from "../Message";
import {useAuth} from "../auth/useAuth";
import PaymentForm from "./PaymentForm";
import {SmartCaptcha} from "@yandex/smart-captcha";

const Deposit = ({className}) => {
    const {isAuthenticated} = useAuth(AuthContext);
    const [amount, setAmount] = useState([]);
    const [orderId, setOrderId] = useState(null);
    const [captchaToken, setCaptchaToken] = useState(null);
    const [resetCaptcha, setResetCaptcha] = useState(0);

    const handleResetCaptcha = () => {
        setResetCaptcha((prev) => prev + 1);
        setCaptchaToken(null);
    };
    const createDepositOrder = () => {
        if (!isAuthenticated) {
            Message.noAuthentication();
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
        }).catch(e => {
            Message.errorsByData(e.response.data)
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
                             submitBtnClassName={'fw-6'}
                             loadingClassName={'text-white-c0'}
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