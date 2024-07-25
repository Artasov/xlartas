// SignInModal.jsx
import React from 'react';
import SignInForm from "./SignInForm";
import Modal from "../elements/Modal/Modal";
import { useAuth } from "./useAuth";
import { AuthContext } from "./AuthContext";
import { useStyles } from "../Theme/useStyles";

const SignInModal = ({ navigate, isOpen }) => {
    const { hideLoginModal, isAuthenticated, untilAuth } = useAuth(AuthContext);
    const classes = useStyles();

    return (
        <Modal className={`${classes.bgPrimary30} ${classes.boxShadowMO06} mw-350px w-95 fs-3 p-4 rounded-4`} isOpen={isOpen}
               onClose={!untilAuth ? hideLoginModal : null}>
            <h3 className={`${classes.textPrimary90} m-0 fs-2 ms-1`}>Sign In</h3>
            <SignInForm navigate={navigate} />
        </Modal>
    );
};

export default SignInModal;
