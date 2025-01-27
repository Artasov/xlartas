// utils/getYearWord.ts

/**
 * Возвращает правильную форму слова "год" в зависимости от числа.
 *
 * @param years - количество лет
 * @returns строка с правильной формой слова "год"
 */
export const getYearWord = (years: number): string => {
    const lastTwoDigits = years % 100;
    const lastDigit = years % 10;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return 'лет';
    }

    switch (lastDigit) {
        case 1:
            return years + ' год';
        case 2:
        case 3:
        case 4:
            return years + ' года';
        default:
            return years + ' лет';
    }
};
