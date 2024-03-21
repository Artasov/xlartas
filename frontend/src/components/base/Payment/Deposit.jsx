import React, {useState} from 'react';
import {AuthContext} from "../auth/AuthContext/AuthContext";
import axiosInstance from "../../../services/base/axiosConfig";
import DynamicForm from "../elements/DynamicForm";
import TextField from "@mui/material/TextField";
import {Message} from "../Message";
import {useAuth} from "../auth/useAuth";
import PaymentForm from "./PaymentForm";

const Deposit = ({className}) => {
    const {isAuthenticated} = useAuth(AuthContext);
    const [amount, setAmount] = useState([]);
    const [orderId, setOrderId] = useState(null);

    const createDepositOrder = () => {
        if (!isAuthenticated) {
            Message.noAuthentication();
            return;
        }
        if (amount < 300) {
            Message.error('Minimum deposit amount 300 RUB');
            return;
        }
        axiosInstance.post('/pay/deposit/', {amount: parseFloat(amount)})
            .then(response => {
                console.log(response.data);
                if(response.data.order_id){
                    setOrderId(response.data.order_id);
                }
            })
            .catch(e => Message.errorsByData(e.response.data));
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
                </DynamicForm>
            }
        </div>
    );
};

export default Deposit;