// Redux/store.ts
import {configureStore} from '@reduxjs/toolkit';
import visibilityReducer from 'Redux/visibilitySlice';
import modalsReducer from 'Redux/modalsSlice';

const store = configureStore({
    reducer: {
        visibility: visibilityReducer,
        modals: modalsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
