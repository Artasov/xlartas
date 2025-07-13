// Modules/Core/LanguageContext.tsx
import React, {createContext, PropsWithChildren, useEffect, useState} from 'react';
import axios from 'axios';
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
        (localStorage.getItem('lang') as Lang) || 'ru',
    );

    const setLang = (l: Lang) => {
        i18n.changeLanguage(l).then();
        moment.locale(l);
        localStorage.setItem('lang', l);
        setLangState(l);
        axios.defaults.headers.common['Accept-Language'] = l;
        axios.post('/api/v1/user/set-lang/', {lang: l}).catch(() => null);
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
