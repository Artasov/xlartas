import React, {useState} from 'react';
import TextField from '@mui/material/TextField';
import {useAuth} from "./useAuth";
import SocialLogin from "./SocialLogin";
import DynamicForm from "../elements/DynamicForm";
import {Message} from "../Message";
import {useNavigate} from "react-router-dom";

const SignInForm = ({className, navigate}) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const {login, hideLoginModal} = useAuth();

    const signIn = async () => {
        try {
            if (!username || !password) {
                Message.error('Username and password fields are required');
                return;
            }
            await login(username, password);
            Message.success('Welcome! You have successfully logged into your account.')
        } catch (e) {
            Message.errorsByData(e.response.data)
        }
    };
    const signUpRedirect = () => {
        hideLoginModal();
        navigate('/');
    }

    return (
        <div className={'fc'}>
            <DynamicForm className={className}
                         requestFunc={signIn}
                         submitBtnClassName={'fw-6'}
                         loadingClassName={'text-white-c0'}
                         submitBtnText={'Sign In'}>
                <TextField
                    label="Username"
                    variant="outlined"
                    type="text"
                    helperText="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    fullWidth
                    margin="dense"
                />
                <TextField
                    label="Password"
                    variant="outlined"
                    type="password"
                    helperText="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    margin="dense"
                />
            </DynamicForm>
            <small className={'fc text-center'}>
                <span className={'text-secondary fs-6 mt-2'}>Not registered yet?</span>
                <span onClick={signUpRedirect} style={{color: 'rgba(183,210,255,0.82)'}}
                    className={'fs-6 cursor-pointer hover-scale-2'}>
                    Create your account now.
                </span>
            </small>
            <SocialLogin/>
        </div>
    );
};

export default SignInForm;
