// SignUpForm.jsx
import React, {useEffect, useState} from 'react';
import {TextField} from '@mui/material';
import axiosInstance from "./auth/axiosConfig";
import {Message} from "./Message";
import DynamicForm from "./elements/DynamicForm";
import {ErrorProcessing} from "./ErrorProcessing";
import {useAuth} from "./auth/useAuth";
import {AuthContext} from "./auth/AuthContext";
import {useStyles} from "./Theme/useStyles";

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
    const {frontendLogout} = useAuth(AuthContext);
    const [code, setCode] = useState('');
    const [codeSent, setCodeSent] = useState(false);
    const [resendTimeout, setResendTimeout] = useState(0);
    const classes = useStyles();

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
        }).catch(error => {
            if (onErrorConfirm != null) onErrorConfirm();
            ErrorProcessing.byResponse(error, frontendLogout);
        });
    }
    const sendNewCode = async () => {
        setResendTimeout(60);
        setCodeSent(true);
        await axiosInstance.post('/api/generate-confirm-code/', {
            action: action,
            email: email
        }).then(response => {
            if (onGeneratedCode != null) onGeneratedCode();
            Message.success(response.data.message, 8000);
        }).catch(error => {
            if (onErrorGeneration != null) onErrorGeneration();
            ErrorProcessing.byResponse(error, frontendLogout);
        });
    };

    return (
        <DynamicForm requestFunc={confirmCode} submitBtnText={'Confirm'}>
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
                    <p className={`${classes.textPrimary55} fs-7 fw-4`}>{`You can resend the code in ${resendTimeout} seconds`}</p>
                ) : (
                    <p onClick={sendNewCode} className={`${classes.textPrimary80} fw-5 fs-6`}>Resend Code</p>
                )}
            </div>
        </DynamicForm>
    );
};

export default ConfirmationCode;

