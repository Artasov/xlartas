// Redux/modalsSlice.ts
import {createSlice} from '@reduxjs/toolkit';

interface ModalsState {
    authModalOpen: boolean;
    // Добавьте сюда другие модальные окна по необходимости, например:
    // contactModalOpen: boolean;
    // feedbackModalOpen: boolean;
}

const initialState: ModalsState = {
    authModalOpen: false,
};

const modalsSlice = createSlice({
    name: 'modals',
    initialState,
    reducers: {
        openAuthModal(state) {
            state.authModalOpen = true;
        },
        closeAuthModal(state) {
            state.authModalOpen = false;
        },
        // Пример для других модалок:
        // openContactModal(state) { state.contactModalOpen = true; },
        // closeContactModal(state) { state.contactModalOpen = false; },
    },
});

export const {openAuthModal, closeAuthModal} = modalsSlice.actions;
export default modalsSlice.reducer;
