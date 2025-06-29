// Redux/actions.js
import store from "Redux/store";
import {
    hideBackgroundFlicker,
    hideHeader,
    showBackgroundFlicker,
    showHeader,
    toggleBackgroundFlicker
} from "Redux/visibilitySlice";

export const showHeaderAction = () => {
    store.dispatch(showHeader());
};

export const hideHeaderAction = () => {
    store.dispatch(hideHeader());
};

export const showBackgroundFlickerAction = () => {
    store.dispatch(showBackgroundFlicker());
};

export const hideBackgroundFlickerAction = () => {
    store.dispatch(hideBackgroundFlicker());
};

export const toggleBackgroundFlickerAction = () => {
    store.dispatch(toggleBackgroundFlicker());
};