// Cabinet/CabinetBaseHeader.tsx
import React from 'react';
import {useNavigate} from 'react-router-dom';
import Divider from "Core/components/elements/Divider";
import {FC, FRSC} from "WideLayout/Layouts";
import BackButton from "Core/components/BackButton";

interface CabinetContentHeaderProps {
    text: string;
    backBtn: boolean;
    className?: string;
}

const CabinetBaseHeader: React.FC<CabinetContentHeaderProps> = ({text, backBtn, className}) => {
    const navigate = useNavigate();


    return (
        <FC px={2} cls={className}>
            <FRSC mb={1} g={1}>
                {backBtn && <BackButton text={''}/>}
                <span className={'fs-5'}>{text}</span>
            </FRSC>
            <Divider/>
        </FC>
    );
};

export default CabinetBaseHeader;
