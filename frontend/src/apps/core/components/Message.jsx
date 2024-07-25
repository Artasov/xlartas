import {toast} from 'react-toastify';

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export class Message {

    static somethingGoWrong = () => {
        this.error('Sorry, something went wrong. We are already working on the problem. Please try again later.')
    }
    static notAuthentication = () => {
        this.error('You must be signed in or create an account to perform this action.')
    }

    static errorsByData(data) {
        try {
            const message = data.message
            if (message) {
                this.error(message);
                const fields_errors = data.fields_errors
                if (fields_errors && fields_errors.length) {
                    fields_errors.forEach(error => {
                        this.error(`${capitalizeFirstLetter(error.field)}: ${error.message}`);
                    })
                }
            } else {
                const detail = data.detail
                if (detail && detail.length) {
                    this.error(detail);
                } else {
                    this.somethingGoWrong();
                }
            }
        } catch (error) {
            this.somethingGoWrong();
        }
    }

    static error(message, autoClose = 5000) {
        toast.error(message, {autoClose: autoClose});
    }

    static info(message, autoClose = 5000) {
        toast.info(message, {autoClose: autoClose});
    }

    static success(message, autoClose = 3000) {
        toast.success(message, {autoClose: autoClose});
    }

    static fieldsErrors({message, fieldErrors}) {
        if (message) {
            this.error(message);
        }
        if (fieldErrors && fieldErrors.length) {
            fieldErrors.forEach(error => {
                this.error(error);
            });
        }
    }
}