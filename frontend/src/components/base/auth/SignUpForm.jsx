// SignUpForm.jsx
import React, {useState} from 'react';
import {TextField} from '@mui/material';
import axiosInstance from "../../../services/base/axiosConfig";
import DynamicForm from "../elements/DynamicForm";
import {useAuth} from "./useAuth";
import {Message} from "../Message";

const SignUpForm = () => {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmation_code: ''
    });
    const [codeSent, setCodeSent] = useState(false);
    const {showLoginModal} = useAuth();

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const signUp = async () => {
        try {
            await axiosInstance.post('/api/signup/', {
                username: formData.username,
                email: formData.email,
                password: formData.password,
            });
            setCodeSent(true);
        } catch (e) {
            Message.errorsByData(e.response.data)
        }
    };
    const verifyCode = async () => {
        try {
            await axiosInstance.post('/api/verify_email/', {
                email: formData.email,
                confirmation_code: formData.confirmation_code,
            });
            setCodeSent(false);
            showLoginModal();
        } catch (e) {
            Message.errorsByData(e.response.data)
        }
    };

    return (
        <div>
            {!codeSent ? (
                <DynamicForm requestFunc={signUp}
                             submitBtnText={'Create ACCOUNT'}
                             submitBtnClassName={'fw-6'}
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
                        value={formData.email}
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
                <DynamicForm requestFunc={verifyCode} submitBtnText={'Confirm Email'}>
                    <TextField
                        name="confirmation_code"
                        label="Confirmation code"
                        variant="outlined"
                        type="text"
                        value={formData.confirmation_code}
                        onChange={handleInputChange}
                        fullWidth
                        margin="dense"
                        helperText={"Enter confirmation code"}
                    />
                </DynamicForm>
            )}
        </div>
    );
};

export default SignUpForm;

