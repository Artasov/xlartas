// Redux/visibilitySlice.js
import {createSlice} from '@reduxjs/toolkit';

export const visibilitySlice = createSlice({
    name: 'visibility',
    initialState: {
        isHeaderVisible: true,
        isBackgroundFlickerEnabled: true,
    },
    reducers: {
        toggleHeader: (state) => {
            state.isHeaderVisible = !state.isHeaderVisible;
        },
        showHeader: (state) => {
            state.isHeaderVisible = true;
        },
        hideHeader: (state) => {
            state.isHeaderVisible = false;
        },
        toggleBackgroundFlicker: (state) => {
            state.isBackgroundFlickerEnabled = !state.isBackgroundFlickerEnabled;
        },
        showBackgroundFlicker: (state) => {
            state.isBackgroundFlickerEnabled = true;
        },
        hideBackgroundFlicker: (state) => {
            state.isBackgroundFlickerEnabled = false;
        },
    },
});

export const {
    toggleHeader,
    showHeader,
    hideHeader,
    toggleBackgroundFlicker,
    showBackgroundFlicker,
    hideBackgroundFlicker,
} = visibilitySlice.actions;

export default visibilitySlice.reducer;
