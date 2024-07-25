// SignUpForm.jsx
import React, {useEffect, useState} from 'react';
import {TextField} from '@mui/material';
import DynamicForm from "../elements/DynamicForm";
import {useAuth} from "./useAuth";
import {Message} from "../Message";
import SocialLogin from "./SocialLogin";
import {AuthContext} from "./AuthContext";
import ConfirmationCode from "../ConfirmationCode";
import {useNavigate} from "react-router-dom";
import {useStyles} from "../Theme/useStyles";

const ResetPasswordForm = () => {
    const [codeSent, setCodeSent] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [email, setEmail] = useState('');
    const {showLoginModal, hideLoginModal} = useAuth(AuthContext);
    const navigate = useNavigate()
    const classes = useStyles();

    useEffect(() => {
        hideLoginModal();
    }, []);

    const onConfirm = () => {
        setCodeSent(false);
        navigate('/');
        showLoginModal();
        Message.success('You have successfully reset password, log in to your account.', 10000)
    }
    return (
        <div className={'mw-300px w-100'}>
            {!codeSent ? (
                <DynamicForm submitBtnText={'CONFIRM RESET'}
                             submitBtnClassName={`fw-6 ${classes.bgPrimary75}`}
                             loadingClassName={`${classes.textPrimary75}`}
                             requestFunc={(e) => {
                                 setCodeSent(true)
                             }}>
                    <TextField
                        required={true}
                        name="email"
                        label="Email"
                        variant="outlined"
                        type="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value)
                        }}
                        fullWidth
                        margin="dense"
                        helperText={"Enter a valid email"}
                    />
                </DynamicForm>
            ) : (
                <div>
                    <TextField
                        required={true}
                        name="password"
                        label="New password"
                        variant="outlined"
                        type="password"
                        value={newPassword}
                        onChange={(e) => {
                            setNewPassword(e.target.value)
                        }}
                        fullWidth
                        margin="dense"
                        helperText={"Enter a valid new password"}
                    />
                    <ConfirmationCode action={'reset_password'}
                                      onConfirm={onConfirm}
                                      onGeneratedCode={(code) => {
                                          setCodeSent(true);
                                      }}
                                      onErrorGeneration={() => {
                                          setCodeSent(false);
                                      }}
                                      autoSend={true}
                                      additional_params={{
                                          new_password: newPassword
                                      }}
                                      email={email}/>
                </div>
            )
            }
            <SocialLogin className={`frcc ${classes.textPrimary65}`} pxIconSize={60}/>
        </div>
    )
        ;
};

export default ResetPasswordForm;

