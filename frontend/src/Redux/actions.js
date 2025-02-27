// Redux/actions.js
import store from "Redux/store";
import {hideHeader, showHeader} from "Redux/visibilitySlice";

export const showHeaderAction = () => {
    store.dispatch(showHeader());
};

export const hideHeaderAction = () => {
    store.dispatch(hideHeader());
};
