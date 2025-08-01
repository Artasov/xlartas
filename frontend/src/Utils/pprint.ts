// Utils/pprint.ts
const isLoggingEnabled: boolean = process.env.NEXT_PUBLIC_ENABLE_LOGS === 'true';

const pprint = (...args: any[]): void => {
    if (isLoggingEnabled) {
        console.log(...args);
    }
}

export default pprint;
