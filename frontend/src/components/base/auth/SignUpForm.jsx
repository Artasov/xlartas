// SignUpForm.jsx
import React, {useState} from 'react';
import {TextField} from '@mui/material';
import axiosInstance from "../../../services/base/axiosConfig";
import DynamicForm from "../elements/DynamicForm";
import {useAuth} from "./useAuth";
import {Message} from "../Message";
import SocialLogin from "./SocialLogin";
import ConfirmationCode from "../ConfirmationCode";
import {AuthContext} from "./AuthContext/AuthContext";

const SignUpForm = () => {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
    });
    const [codeSent, setCodeSent] = useState(false);
    const {showLoginModal, user} = useAuth(AuthContext);

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const signUp = async () => {
        await axiosInstance.post('/api/signup/', {
            username: formData.username,
            email: formData.email,
            password: formData.password,
        }).then(response => {
            Message.success(response.data.message)
            setCodeSent(true);
        }).catch(e => Message.errorsByData(e.response.data));
    };

    const onConfirm = () => {
        showLoginModal();
        setCodeSent(false);
        Message.success('You have successfully registered, log in to your account.', 10000)
    }
    return (
        <div>
            {!codeSent ? (
                <DynamicForm requestFunc={signUp}
                             submitBtnText={'Create ACCOUNT'}
                             submitBtnClassName={'fw-6 bg-white-c0'}
                             loadingClassName={'text-white-c0'}>
                    <TextField
                        required={true}
                        name="username"
                        label="Username"
                        variant="outlined"
                        type="text"
                        value={formData.username}
                        onChange={handleInputChange}
                        fullWidth
                        margin="dense"
                        helperText={"Enter username"}
                    />
                    <TextField
                        required={true}
                        name="email"
                        label="Email"
                        variant="outlined"
                        type="email"
                        value={formData.email.toLowerCase()}
                        onChange={handleInputChange}
                        fullWidth
                        margin="dense"
                        helperText={"Enter a valid email"}
                    />
                    <TextField
                        required={true}
                        name="password"
                        label="Password"
                        variant="outlined"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        fullWidth
                        margin="dense"
                        helperText={"Enter password"}
                    />
                </DynamicForm>
            ) : (
                <ConfirmationCode action={'signup'} onConfirm={onConfirm} autoSend={true}
                                  email={user ? user.email : formData.email}/>
            )}
            <SocialLogin className={'frsc text-white-a0'} pxIconSize={60}/>
        </div>
    );
};

export default SignUpForm;

