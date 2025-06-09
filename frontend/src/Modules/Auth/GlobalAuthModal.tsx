// Modules/Auth/GlobalAuthModal.tsx
import React from 'react';
import Modal from "Core/components/elements/Modal/Modal";
import AuthForm from "Auth/forms/AuthForm";
import {FC} from "wide-containers";
import {closeAuthModal} from 'Redux/modalsSlice';
import {useDispatch, useSelector} from "react-redux";

const GlobalAuthModal: React.FC = () => {
    const dispatch = useDispatch();
    const authModalOpen = useSelector((state: any) => state.modals.authModalOpen);

    return (
        <Modal
            closeBtn={false}
            title=""
            sxContent={{px: 2}}
            isOpen={authModalOpen}
            cls="w-100 maxw-380px"
            onClose={() => dispatch(closeAuthModal())}
        >
            <FC mb={20}>
                <AuthForm ways={['social', 'password', 'email']}/>
            </FC>
        </Modal>
    );
};

export default GlobalAuthModal;
