// modalSlice.js
import { createSlice } from '@reduxjs/toolkit';

export const modalSlice = createSlice({
    name: 'modal',
    initialState: {
        isLoginModalOpen: false,
        untilAuth: false,
    },
    reducers: {
        showLoginModal: (state, action) => {
            state.isLoginModalOpen = true;
            state.untilAuth = action.payload?.untilAuth || false;
        },
        hideLoginModal: (state) => {
            if (!state.untilAuth) {
                state.isLoginModalOpen = false;
            }
        },
        setUntilAuth: (state, action) => {
            state.untilAuth = action.payload;
        },
    },
});

export const { showLoginModal, hideLoginModal, setUntilAuth } = modalSlice.actions;

export default modalSlice.reducer;
