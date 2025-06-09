// Modules/Company/CompanyDocumentDetail.tsx
import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {Message} from 'Core/components/Message';
import CircularProgress from 'Core/components/elements/CircularProgress';
import ReactMarkdown from 'react-markdown';
import {Link, Typography} from '@mui/material';
import {FC} from "wide-containers";
import {CompanyDocument} from "Company/Types";
import {useApi} from "../Api/useApi";


const CompanyDocumentDetail: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const [document, setDocument] = useState<CompanyDocument | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const {api} = useApi();
    useEffect(() => {
        const fetchDocument = async () => {
            api.get(`/api/v1/docs/${id}/`).then(data => setDocument(data)).finally(() => setLoading(false));
        };
        if (id) {
            fetchDocument().then();
        } else {
            setLoading(false);
            Message.error('ID документа не указан.');
        }
    }, [id]);

    if (loading) return <CircularProgress size="60px"/>;

    if (!document) return <Typography variant="body1">Документ не найден.</Typography>;

    return (
        <FC maxW={700} pb={2} px={2} mx={'auto'}>
            {document.file_url &&
                <Link href={document.file_url} target="_blank" rel="noopener noreferrer">
                    Скачать документ
                </Link>
            }
            {document.content && <ReactMarkdown>{document.content}</ReactMarkdown>}
        </FC>
    );
};

export default CompanyDocumentDetail;
