// SignUpForm.jsx
import React, {useEffect, useState} from 'react';
import {TextField} from '@mui/material';
import axiosInstance from "../../services/base/axiosConfig";
import {Message} from "./Message";
import DynamicForm from "./elements/DynamicForm";

const ConfirmationCode = ({
                              email,
                              action,
                              onConfirm,
                              onErrorGeneration = null,
                              onErrorConfirm = null,
                              onGeneratedCode = null,
                              additional_params = {},
                              autoSend = true
                          }) => {
    const [code, setCode] = useState('');
    const [codeSent, setCodeSent] = useState(false);
    const [resendTimeout, setResendTimeout] = useState(0);

    useEffect(() => {
        if (autoSend) {
            sendNewCode();
        }
    }, [autoSend]);

    useEffect(() => {
        let interval = null;
        if (codeSent && resendTimeout > 0) {
            interval = setInterval(() => {
                setResendTimeout((resendTimeout) => resendTimeout - 1);
            }, 1000);
        } else if (resendTimeout === 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [codeSent, resendTimeout]);

    const confirmCode = async () => {
        await axiosInstance.post('/api/confirm-code/', {
            code: code,
            ...additional_params,
        }).then(response => {
            onConfirm();
            Message.success(response.data.message);
        }).catch(e => {
            if (onErrorConfirm != null) onErrorConfirm();
            Message.errorsByData(e.response.data)
        });
    }
    const sendNewCode = async () => {
        setResendTimeout(5);
        setCodeSent(true);
        await axiosInstance.post('/api/generate-confirm-code/', {
            action: action,
            email: email
        }).then(response => {
            if (onGeneratedCode != null) onGeneratedCode();
            Message.success(response.data.message, 8000);
        }).catch(e => {
            if (onErrorGeneration != null) onErrorGeneration();
            Message.errorsByData(e.response.data)
        });
    };

    return (
        <DynamicForm submitBtnClassName={'bg-white-c0'} requestFunc={confirmCode} submitBtnText={'Confirm'}>
            <small className={'mb-2'}>Check your email.</small>
            <TextField
                name="confirmation_code"
                label="Confirmation code"
                variant="outlined"
                type="text"
                value={code}
                onChange={(e) => {
                    setCode(e.target.value)
                }}
                className={'m-0'}
                fullWidth
                margin="dense"
                helperText={"Enter confirmation code"}
            />
            <div>{
                resendTimeout > 0 ? (
                    <p className={'text-white-90 fs-7 fw-4'}>{`You can resend the code in ${resendTimeout} seconds`}</p>
                ) : (
                    <p onClick={sendNewCode} className="text-white-c0 fw-5 fs-6">Resend Code</p>
                )}
            </div>
        </DynamicForm>
    );
};

export default ConfirmationCode;

