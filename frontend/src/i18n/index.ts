// i18n/index.ts
import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n.use(LanguageDetector)       // читает localStorage.lang, а потом navigator
    .use(initReactI18next)
    .init({
        resources: {
            ru: {translation: require('./locales/ru.json')},
            en: {translation: require('./locales/en.json')},
        },
        fallbackLng: 'ru',
        interpolation: {escapeValue: false},
        detection: {order: ['localStorage', 'navigator']},
    }).then();

export default i18n;
