// core/services/validator/base.ts
export const isEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
};

export const isPhone = (value: string): boolean => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 формат (международный формат телефонного номера)
    return phoneRegex.test(value);
};
