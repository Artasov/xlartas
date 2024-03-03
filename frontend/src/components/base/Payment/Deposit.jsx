import React, {useContext, useState} from 'react';
import {AuthContext} from "../auth/AuthContext/AuthContext";
import axiosInstance from "../../../services/base/axiosConfig";
import DynamicForm from "../elements/DynamicForm";
import TextField from "@mui/material/TextField";

const Deposit = ({onSuccessDeposit, className}) => {
    const {user, isAuthenticated, showLoginModal, logout} = useContext(AuthContext);
    const [amount, setAmount] = useState([]);


    const createDepositOrder = (setErrors) => {
        setErrors({});
        if (isAuthenticated) {
            if (amount < 300){
                setErrors({'error':'Minimum deposit amount 300 RUB'});
                return;
            }
            axiosInstance.post('/deposit/', {amount: amount})
                .then(response => {
                    console.log(response.data);
                    onSuccessDeposit();
                })
                .catch(error => {
                    setErrors(error.response.data);
                });
        } else logout();
    }


    return (
        <div style={{maxWidth: 400, margin: 'auto'}}>
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
        </div>
    );
};

export default Deposit;