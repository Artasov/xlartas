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
        <Dialog
            open={authModalOpen}
            onClose={() => dispatch(closeAuthModal())}
            className="w-100 maxw-380px"
        >
            <DialogContent sx={{px: 2}}>
                <FC mb={20}>
                    <AuthForm ways={['social', 'password', 'email']}/>
                </FC>
            </DialogContent>
        </Dialog>
    );
};

export default GlobalAuthModal;