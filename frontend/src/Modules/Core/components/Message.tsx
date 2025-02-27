// Modules/Core/components/Message.tsx
import {toast} from 'react-toastify';

function capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

interface FieldError {
    field: string;
    message: string;
}

interface ErrorData {
    message?: string;
    fields_errors?: FieldError[];
    detail?: string;
}

export class Message {
    static somethingGoWrong = (): void => {
        this.error('Sorry, something went wrong. We are already working on the problem. Please try again later.');
    }

    static notAuthentication = (): void => {
        this.error('Вы должны войти в систему или создать аккаунт, чтобы выполнить это действие.');
    }

    static errorsByData(data: ErrorData): void {
        try {
            const message = data.message;
            if (message) {
                this.error(message);
                const fields_errors = data.fields_errors;
                if (fields_errors && fields_errors.length) {
                    fields_errors.forEach(error => {
                        this.error(`${capitalizeFirstLetter(error.field)}: ${error.message}`);
                    });
                }
            } else {
                const detail = data.detail;
                if (detail) {
                    this.error(detail);
                } else {
                    this.somethingGoWrong();
                }
            }
        } catch (error) {
            this.somethingGoWrong();
        }
    }

    static error(message: string, predelay: number = 0, autoClose: number = 5000): void {
        if (predelay != 0) setTimeout(() => {
            toast.error(message, {autoClose});
        }, predelay);
        else toast.error(message, {autoClose});

    }

    static info(message: string, predelay: number = 0, autoClose: number = 5000): void {
        if (predelay != 0) setTimeout(() => {
            toast.info(message, {autoClose});
        }, predelay);
        else toast.info(message, {autoClose});

    }

    static success(message: string, predelay: number = 0, autoClose: number = 3000): void {
        if (predelay != 0) setTimeout(() => {
            toast.success(message, {autoClose});
        }, predelay);
        else toast.success(message, {autoClose});

    }

    static fieldsErrors({message, fieldErrors}: { message?: string, fieldErrors?: string[] }): void {
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
