// Modules/Docs/ContractOffer.tsx
import React from "react";
import {FC} from "wide-containers";
// @ts-ignore

const ContractOffer: React.FC = () => {
    return (
        <FC
            maxWidth="md"
            margin="auto"
            py="4rem"
            px={2}
        >
            <FC mb="2rem">
                <FC
                    fontSize="2.4rem"
                    lh={'3rem'}
                    fontWeight="bold"
                    mb="1.5rem"
                    cls={'text-nowrap'}
                    color="#212529">
                    Договор Оферты
                </FC>

                <FC fontSize="1.5rem"
                    fontWeight="bold"
                    mb="1rem"
                    color="#212529">
                    1. ОБЩИЕ ПОЛОЖЕНИЯ
                </FC>
            </FC>
        </FC>
    );
};

export default ContractOffer;
