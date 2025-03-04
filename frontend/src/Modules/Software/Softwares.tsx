// Modules/Software/Softwares.tsx

import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import CircularProgress from 'Core/components/elements/CircularProgress';
import {FC, FCC, FRCC, FRSE} from 'WideLayout/Layouts';
import {useTheme} from "Theme/ThemeContext";
import {ISoftware} from "./Types/Software";
import {useApi} from "../Api/useApi";


const Softwares: React.FC = () => {
    const [softwares, setSoftwares] = useState<ISoftware[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const {plt} = useTheme();
    const {api} = useApi();

    useEffect(() => {
        setLoading(true);
        api.get('/api/v1/software/').then(data => {
            setSoftwares(data);
        }).finally(() => setLoading(false));
    }, [api]);

    if (loading) return <FRCC mt={4} w={'100%'}><CircularProgress size={'90px'}/></FRCC>;

    return (
        <FRCC g={2} wrap>
            {softwares.length
                ? softwares.map(s => (
                    <FC rounded={3} maxW={300} cursorPointer
                        bg={plt.bg.primary}
                        key={s.id} onClick={() => navigate(`/softwares/${s.id}`)}>
                        <img src={s.pic} className={'rounded-top-3'} style={{
                            maxHeight: 120, objectFit: 'cover'
                        }} alt=""/>
                        <FC px={2} py={2} g={1}>
                            <FRSE g={'.1rem'}>
                                <h2 style={{
                                    lineHeight: '1.4rem',
                                    fontSize: '1.8rem',
                                    margin: 0,
                                }}>{s.name}</h2>
                                {s.file && <span style={{
                                    color: plt.text.primary30,
                                    fontSize: '.8rem',
                                    lineHeight: '.8rem'
                                }}>v.{s.file.version}</span>}
                            </FRSE>
                            <p style={{color: plt.text.primary50}}>
                                {s.short_description?.slice(0, 120)}
                                {(s.short_description && s.short_description.length > 120) ? '...' : ''}
                            </p>
                        </FC>
                    </FC>
                ))
                : <FRCC>Нет доступных программ</FRCC>
            }
        </FRCC>
    );
};

export default Softwares;
