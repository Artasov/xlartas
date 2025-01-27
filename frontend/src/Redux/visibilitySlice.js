// visibilitySlice.js
import {createSlice} from '@reduxjs/toolkit';

export const visibilitySlice = createSlice({
    name: 'visibility',
    initialState: {
        isHeaderVisible: true,
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
    },
});

export const {toggleHeader, showHeader, hideHeader} = visibilitySlice.actions;

export default visibilitySlice.reducer;
