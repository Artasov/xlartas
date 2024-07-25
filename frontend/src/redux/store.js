// store.js
import { configureStore } from '@reduxjs/toolkit';
import visibilityReducer from './visibilitySlice';
import modalReducer from './modalSlice';

const store = configureStore({
    reducer: {
        visibility: visibilityReducer,
        modal: modalReducer,
    },
});

export default store;
