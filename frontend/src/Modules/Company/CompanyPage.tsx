'use client';

// Modules/Company/CompanyPage.tsx
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate, useParams} from 'Utils/nextRouter';
import {Message} from 'Core/components/Message';
import CircularProgressZoomify from 'Core/components/elements/CircularProgressZoomify';
import {FC, FCSS, FR} from "wide-containers";
import {Company} from "Company/Types";
import {useTheme} from "Theme/ThemeContext";
import {useCompanyApi} from 'Company/useCompanyApi';
import copyToClipboard from "Utils/clipboard";
import Head from "Core/components/Head";


const CompanyPage: React.FC = () => {
    const {name} = useParams<{ name: string }>();
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();
    const {theme} = useTheme();
    const {getCompany} = useCompanyApi();
    const {t} = useTranslation();

    useEffect(() => {
        if (!name) return
        const fetchCompany = async () => {
            getCompany(name).then(data => setCompany(data)).finally(() => setLoading(false));
        };
        if (name) {
            fetchCompany().then();
        } else {
            setLoading(false);
            Message.error(t('company_name_not_specified'));
        }
    }, [name, getCompany]);

    if (loading) {
        return <CircularProgressZoomify in size="60px"/>;
    }

    if (!company) {
        return <FR>Компания не найдена.</FR>;
    }

    return (
        <FCSS lh={'1.3rem'} px={2} g={1} maxW={500} mx={'auto'}>
            <Head title={`${company ? company.name + ' - ' : ''}`}/>
            <h1 style={{lineHeight: '1.6rem'}} className={'fs-4'}>{company.name}</h1>
            <h2 style={{lineHeight: '1.4rem'}} className={'fs-5'}>Общее</h2>
            <FC pl={2}>
                {typeof company.person_name === 'string' &&
                    <span>
                        <span>ИП: </span>
                        <span className={'cred-span'} onClick={
                            () => copyToClipboard(String(company.person_name))
                        }>{company.person_name}</span>
                    </span>}
                <span>
                    <span>Адрес: </span>
                    <span className={'cred-span'} onClick={
                        () => copyToClipboard(company.address)
                    }>{company.address}</span>
                </span>
                <span>
                    <span>ОГРН: </span>
                    <span className={'cred-span'} onClick={
                        () => copyToClipboard(company.ogrn)
                    }>{company.ogrn}</span>
                </span>
                <span>
                    <span>ИНН: </span>
                    <span className={'cred-span'} onClick={
                        () => copyToClipboard(company.inn)
                    }>{company.inn}</span>
                </span>
                <span>
                    <span>БИК банка: </span>
                    <span className={'cred-span'} onClick={
                        () => copyToClipboard(company.bik)
                    }>{company.bik}</span>
                </span>
                <span>
                    <span>Корреспондентский счет: </span>
                    <span className={'cred-span'} onClick={
                        () => copyToClipboard(company.current_account)
                    }>{company.current_account}</span>
                </span>
                <span>
                    <span>Расчетный счет: </span>
                    <span className={'cred-span'} onClick={
                        () => copyToClipboard(company.checking_account)
                    }>{company.checking_account}</span>
                </span>
            </FC>
            {company.documents && company.documents.length > 0
                ? <>
                    <h2 className={'fs-5'}>Документы</h2>
                    <FC pl={2} g={1}>
                        {company.documents.map((doc) => (
                            <FR cursorPointer color={theme.colors.secondary.light} lh={'1rem'} key={doc.id}
                                onAuxClick={() => {
                                    window.open(`/docs/${doc.id}/`, '_blank');
                                }} onClick={() => {
                                navigate(`/docs/${doc.id}/`)
                            }}>{doc.title}</FR>
                        ))}
                    </FC>
                </>
                : <FR>Документы не найдены.</FR>
            }
        </FCSS>
    );
};

export default CompanyPage;
