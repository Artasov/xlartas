const isLoggingEnabled: boolean = process.env.REACT_APP_ENABLE_LOGS === 'true';

const pprint = (...args: any[]): void => {
    if (isLoggingEnabled) {
        console.log(...args);
    }
}

export default pprint;
