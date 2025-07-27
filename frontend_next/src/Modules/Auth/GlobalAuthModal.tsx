// Modules/Auth/GlobalAuthModal.tsx
import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import AuthForm from 'Auth/forms/AuthForm';
import {FC} from 'wide-containers';
import {closeAuthModal} from 'Redux/modalsSlice';
import {useDispatch, useSelector} from 'react-redux';

const GlobalAuthModal: React.FC = () => {
    const dispatch = useDispatch();
    const authModalOpen = useSelector((state: any) => state.modals.authModalOpen);

    return (
        <Dialog slotProps={{
            paper: {
                sx: {
                    width: '100%',
                    maxWidth: 350,
                    m: 1,                // небольшой отступ от краёв экрана
                },
            },
        }} open={authModalOpen} onClose={() => dispatch(closeAuthModal())}>
            <DialogContent sx={{px: 2}}>
                <FC>
                    <AuthForm ways={['social', 'password', 'email']}/>
                </FC>
            </DialogContent>
        </Dialog>
    );
};

export default GlobalAuthModal;