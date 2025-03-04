// Modules/Company/CompanyPage.tsx
import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Message} from 'Core/components/Message';
import CircularProgress from 'Core/components/elements/CircularProgress';
import {FC, FCSS, FR} from "WideLayout/Layouts";
import {Company} from "Company/Types";
import {useTheme} from "Theme/ThemeContext";
import {useApi} from "../Api/useApi";


const CompanyPage: React.FC = () => {
    const {name} = useParams<{ name: string }>();
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();
    const {plt, theme} = useTheme();
    const {api} = useApi();

    useEffect(() => {
        if (!name) return
        const fetchCompany = async () => {
            api.get(`/api/v1/companies/${encodeURIComponent(name)}/`).then(data => setCompany(data)).finally(() => setLoading(false));
        };
        if (name) {
            fetchCompany();
        } else {
            setLoading(false);
            Message.error('Название компании не указано.');
        }
    }, [name, api]);

    if (loading) {
        return <CircularProgress size="60px"/>;
    }

    if (!company) {
        return <FR>Компания не найдена.</FR>;
    }

    return (
        <FCSS lh={'1.3rem'} px={2} g={1} maxW={400} mx={'auto'}>
            <h1 style={{lineHeight: '1.6rem'}} className={'fs-4'}>{company.name}</h1>
            <h2 style={{lineHeight: '1.4rem'}} className={'fs-5'}>Общее</h2>
            <FC pl={2}>
                <FR>ИП: {company.person_name}</FR>
                <FR>Адрес: {company.address}</FR>
                <FR>ОГРН: {company.ogrn}</FR>
                <FR>ИНН: {company.inn}</FR>
                <FR>БИК банка: {company.bik}</FR>
                <FR>Корреспондентский счет: {company.current_account}</FR>
                <FR>Расчетный счет: {company.checking_account}</FR>
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
