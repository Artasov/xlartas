// SignUpForm.jsx
import React, {useState} from 'react';
import {Alert, TextField} from '@mui/material';
import axiosInstance from "../../../services/base/axiosConfig";
import DynamicForm from "../elements/DynamicForm";
import {useNavigate} from "react-router-dom";

const SignUpForm = () => {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmation_code: ''
    });
    const [codeSent, setCodeSent] = useState(false);
    const [error, setError] = useState({});
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        // Reset error on input change
        setError({
            ...error,
            [name]: '',
        });
    };

    const handleSignUp = async (e) => {
        setError({});
        try {
            await axiosInstance.post('/api/signup/', {
                username: formData.username,
                email: formData.email,
                password: formData.password,
            });
            setCodeSent(true);
        } catch (err) {
            setError(err.response.data);
        }
    };
    const verifyCode = async (e) => {
        setError({});
        try {
            await axiosInstance.post('/api/verify_email/', {
                email: formData.email, // Ensure formData.email is used
                confirmation_code: formData.confirmation_code,
            });
            navigate('/');
        } catch (err) {
            setError(err.response.data);
        }
    };

    return (
        <div>
            {!codeSent ? (
                <DynamicForm requestFunc={handleSignUp}
                             submitBtnText={'Create ACCOUNT'}
                             submitBtnClassName={'fw-6'}
                             loadingClassName={'text-white-c0'}>
                    <TextField
                        name="username"
                        label="Username"
                        variant="outlined"
                        type="text"
                        value={formData.username}
                        onChange={handleInputChange}
                        fullWidth
                        margin="dense"
                        error={!!error.username}
                        helperText={error.username || "Enter username"}
                    />
                    <TextField
                        name="email"
                        label="Email"
                        variant="outlined"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        fullWidth
                        margin="dense"
                        error={!!error.email}
                        helperText={error.email || "Enter a valid email"}
                    />
                    <TextField
                        name="password"
                        label="Password"
                        variant="outlined"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        fullWidth
                        margin="dense"
                        error={!!error.password}
                        helperText={error.password || "Enter password"}
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
                        error={!!error.confirmation_code}
                        helperText={error.confirmation_code || "Enter confirmation code"}
                    />
                </DynamicForm>
            )}
            {
                Object.values(error).some(e => e) &&
                <Alert className={'bg-danger bg-opacity-10'} severity="error">{Object.values(error)[0]}</Alert>
            }
        </div>
    );
};

export default SignUpForm;

