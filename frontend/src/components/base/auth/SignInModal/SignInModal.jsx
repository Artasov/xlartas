// SignInModal.js
import React from 'react';
import Modal from '../../elements/Modal/Modal';
import SignInForm from '../SignInForm/SignInForm';

const SignInModal = ({show, onSubmit}) => {
    return (
        <Modal className={'login-modal-content fs-3 bg-black-55 p-4 rounded-4 shadow-black-5-90'} isOpen={show} onClose={onSubmit}>
            <h3 className={'m-0 fs-2 ms-1'}>Sign In</h3>
            <SignInForm onSubmit={onSubmit}/>
        </Modal>
    );
};

export default SignInModal;
