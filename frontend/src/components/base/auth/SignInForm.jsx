import React, {useState} from 'react';
import TextField from '@mui/material/TextField';
import {useAuth} from "./useAuth";
import SocialLogin from "./SocialLogin";
import DynamicForm from "../elements/DynamicForm";

const SignInForm = ({className}) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const {login} = useAuth();

    const signIn = async (setErrors) => {
        try {
            if (!username || !password) {
                setErrors(['Username and password fields are required']);
                return;
            }
            await login(username, password);
        } catch (e) {
            if (e.response.data.detail) {
                setErrors([e.response.data.detail]);
            } else {
                setErrors(['Something go wrong']);
            }
        }
    };

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
            <SocialLogin/>
        </div>
    );
};

export default SignInForm;
