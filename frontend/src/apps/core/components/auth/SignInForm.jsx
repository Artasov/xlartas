import React, {useState} from 'react';
import TextField from '@mui/material/TextField';
import {useAuth} from "./useAuth";
import SocialLogin from "./SocialLogin";
import DynamicForm from "../elements/DynamicForm";
import {Message} from "../Message";
import {ErrorProcessing} from "../ErrorProcessing";
import {AuthContext} from "./AuthContext";
import {useStyles} from "../Theme/useStyles";

const SignInForm = ({className, navigate}) => {
    const {frontendLogout} = useAuth(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const {login, hideLoginModal} = useAuth();
    const classes = useStyles();

    const signIn = async () => {
        try {
            if (!username || !password) {
                Message.error('Username/Email and password fields are required');
                return;
            }
            await login(username, password);
            Message.success('Welcome! You have successfully logged into your account.')
        } catch (error) {
            ErrorProcessing.byResponse(error, frontendLogout);
        }
    };
    const signUpRedirect = () => {
        hideLoginModal();
        navigate('/');
    }

    return (<div className={'fc'}>
        <DynamicForm className={className}
                     requestFunc={signIn}
                     submitBtnClassName={`${classes.textContrast95} ${classes.bgContrast85} fw-6`}
                     loadingClassName={`${classes.textContrast55}`}
                     submitBtnText={'Sign In'}>
            <TextField
                label="Username / Email"
                variant="outlined"
                type="text"
                helperText="Enter your username or email"
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
        <small className={'fc mt-2 text-right'}>
            <span className={`${classes.textPrimary70} mt-3px fs-6`}
                  onClick={() => {
                      navigate('/reset-password')
                  }}>
                Forgot password?
            </span>
            <span onClick={signUpRedirect}
                  className={`${classes.textPrimary70} mt-3px fs-6 cursor-pointer hover-scale-2`}>
                    Create your account now.
                </span>
        </small>
        <SocialLogin iconsClassName={`${classes.textPrimary80}`}/>
    </div>);
};

export default SignInForm;
