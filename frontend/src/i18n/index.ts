// i18n/index.ts
import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

// Важно: этот проект использует i18n внутри Client Components, которые рендерятся на сервере.
// Автодетект языка через браузерные API (localStorage/navigator) даёт разные результаты на сервере и в браузере,
// что ломает hydration. Поэтому стартовый язык делаем детерминированным, а переключение — через LangProvider.
void i18n
    .use(initReactI18next)
    .init({
        resources: {
            ru: {translation: require('./locales/ru.json')},
            en: {translation: require('./locales/en.json')},
        },
        lng: 'ru',
        fallbackLng: 'ru',
        interpolation: {escapeValue: false},
        initImmediate: false,
    });

export default i18n;
