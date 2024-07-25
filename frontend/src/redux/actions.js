// src/redux/actions.js
import store from './store';
import {hideHeader, showHeader} from "./visibilitySlice";

export const showHeaderAction = () => {
    store.dispatch(showHeader());
};

export const hideHeaderAction = () => {
    store.dispatch(hideHeader());
};
