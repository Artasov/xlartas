// Modules/Core/LanguageContext.tsx
import React, {createContext, PropsWithChildren, useCallback, useEffect, useMemo, useState} from 'react';
import axios from 'axios';
import {useCoreApi} from 'Core/useCoreApi';
import moment from 'moment';
import 'moment/locale/ru';
import i18n from "../../i18n";

type Lang = 'ru' | 'en';

export const LangCtx = createContext<{
    lang: Lang;
    setLang: (l: Lang) => void;
}>({
    lang: 'ru', setLang: () => {
    }
});

export const LangProvider: React.FC<PropsWithChildren> = ({children}) => {
    const [lang, setLangState] = useState<Lang>('ru');
    const {setLang: setLangRequest} = useCoreApi();


    const setLang = useCallback((l: Lang) => {
        i18n.changeLanguage(l).then();
        moment.locale(l);
        if (typeof window !== 'undefined') {
            localStorage.setItem('lang', l);
        }
        setLangState(l);
        axios.defaults.headers.common['Accept-Language'] = l;
        setLangRequest(l);
    }, [setLangRequest]);

    /* init once */
    useEffect(() => {
        const stored = typeof window !== 'undefined' ? (localStorage.getItem('lang') as Lang | null) : null;
        let initialLang: Lang = 'ru';
        if (stored === 'en' || stored === 'ru') initialLang = stored;
        else if (typeof navigator !== 'undefined') initialLang = navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'ru';
        i18n.changeLanguage(initialLang).then();
        moment.locale(initialLang);
        axios.defaults.headers.common['Accept-Language'] = initialLang;
        setLangState(initialLang);
    }, []);

    const value = useMemo(() => ({lang, setLang}), [lang, setLang]);
    return (
        <LangCtx.Provider value={value}>
            {children}
        </LangCtx.Provider>
    );
};
