// src/Modules/Auth/GlobalAuthModal.tsx
import React from 'react';
import Modal from "Core/components/elements/Modal/Modal";
import AuthForm from "Auth/forms/AuthForm";
import {FC} from "WideLayout/Layouts";
import {closeAuthModal} from 'Redux/modalsSlice';
import {useDispatch, useSelector} from "react-redux";

const GlobalAuthModal: React.FC = () => {
    const dispatch = useDispatch();
    const authModalOpen = useSelector((state: any) => state.modals.authModalOpen);

    return (
        <Modal
            closeBtn={false}
            title=""
            clsModalScroll="px-3 "
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
