// Modules/Landing/Footer.tsx
import React, {useEffect, useState} from 'react';
import {FC} from 'wide-containers';
import {useTheme} from 'Theme/ThemeContext';
import {useApi} from '../Api/useApi';
import {Company} from 'Company/Types';
import {useNavigate} from "react-router-dom";

const Footer: React.FC = () => {
    const {plt} = useTheme();
    const {api} = useApi();
    const [company, setCompany] = useState<Company | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        api.get<Company>('/api/v1/companies/XLARTAS/').then(setCompany).catch(() => {
            setCompany(null);
        });
    }, [api]);

    return (
        <FC component={'footer'}
            pos={'absolute'}
            bottom={2}
            left={0}
            w={'100%'}
            px={1}
            opacity={10}
            style={{
                background: plt.background.default + 'aa',
                color: plt.text.primary,
                fontSize: '.75rem',
                textAlign: 'center',
                backdropFilter: 'blur(4px)',
            }}>
            {company ? (
                <span style={{
                    margin: '0 auto',
                    lineHeight: '.45rem', fontSize: '.5rem'
                }}>
                    <span>
                        <span>
                            {company.name},
                            ИП {company.person_name},
                            ИНН {company.inn},
                            ОГРН {company.ogrn},
                            {company.address},
                            БИК Банка {company.bik},
                            Корреспондентский счет {company.current_account},
                            Расчетный счет {company.checking_account},
                            e-mail:&nbsp;
                        </span>
                        <a href="mailto:ivanhvalevskey@gmail.com"
                           style={{color: 'inherit'}}>ivanhvalevskey@gmail.com</a>,&nbsp;
                    </span>
                    <span>
                        {company.documents.map((doc, idx) => (
                            <React.Fragment key={doc.id}>
                                {idx > 0 && ' | '}
                                <span onClick={() => {
                                    navigate(`/docs/${doc.id}`)
                                }}>{doc.title}</span>
                            </React.Fragment>
                        ))}
                    </span>
                </span>
            ) : (
                <span>xlartas</span>
            )}
        </FC>
    );
};

export default Footer;