// SignInModal.jsx
import React from 'react';
import SignInForm from "./SignInForm";
import Modal from "../elements/Modal/Modal";

const SignInModal = ({navigate, show, onSubmit}) => {
    return (
        <Modal className={'mw-350px w-95 fs-3 bg-black-55 p-4 rounded-4 shadow-black-5-90'} isOpen={show}
               onClose={onSubmit}>
            <h3 className={'m-0 fs-2 ms-1'}>Sign In</h3>
            <SignInForm navigate={navigate}/>
        </Modal>
    );
};

export default SignInModal;
