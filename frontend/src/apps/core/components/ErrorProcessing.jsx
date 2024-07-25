import {Message} from "./Message";

export class ErrorProcessing {
    static notAuthentication = (frontendLogout) => {
        if (!frontendLogout) throw new Error("The notAuthentication function requires a function to be executed as its first parameter.")
        Message.notAuthentication();
        frontendLogout();
    }

    static byResponse = (error, frontendLogout) => {
        if (!error.response) {
            console.error(error)
            return;
        }
        const response = error.response;
        if (!response.data) {
            console.log(response)
            console.error(error)
            return;
        }
        const data = response.data;
        const detail = data.detail;
        const status = response.status;
        if (status === 403 &&
            detail &&
            detail.length &&
            (
                detail.includes('Authentication credentials were not provided') ||
                detail.includes('Given token not valid for any token type')
            )
        ) {
            this.notAuthentication(frontendLogout);
        } else {
            Message.errorsByData(data);
        }
    }
}