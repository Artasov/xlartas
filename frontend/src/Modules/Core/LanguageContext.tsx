// Modules/Core/LanguageContext.tsx
import React, {createContext, PropsWithChildren, useEffect, useState} from 'react';
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
    const [lang, setLangState] = useState<Lang>(() =>
        typeof window !== 'undefined'
            ? ((localStorage.getItem('lang') as Lang) || 'ru')
            : 'ru',
    );
    const {setLang: setLangRequest} = useCoreApi();


    const setLang = (l: Lang) => {
        i18n.changeLanguage(l).then();
        moment.locale(l);
        if (typeof window !== 'undefined') {
            localStorage.setItem('lang', l);
        }
        setLangState(l);
        axios.defaults.headers.common['Accept-Language'] = l;
        setLangRequest(l);
    };

    /* init once */
    useEffect(() => {
        i18n.changeLanguage(lang).then();
        moment.locale(lang);
        axios.defaults.headers.common['Accept-Language'] = lang;
    }, []);

    return (
        <LangCtx.Provider value={{lang, setLang}}>
            {children}
        </LangCtx.Provider>
    );
};
