// Modules/xLMine/Privilege/PrivilegeItem.tsx
import React from "react";
import {useTheme} from "Theme/ThemeContext";
import Tooltip from "@mui/material/Tooltip";
import {FC, FRBC, FRC, FRSC} from "wide-containers";

interface IPrivilegeExtended {
    id: string;
    name: string;
    threshold: string;
    description?: string;
    color?: string | null;
}

const PrivilegeItem: React.FC<{ priv: IPrivilegeExtended }> = ({priv}) => {
    const {plt} = useTheme();

    return (
        <FRSC g={2} pos="relative">
            <FC key={priv.id} rounded={6} w={'11px'} h={'11px'} sx={{opacity: '90%'}}
                bg={priv.color || plt.text.accent}/>
            <FRBC g={2} w={'100%'}>
                <FRC>{parseInt(priv.threshold)}₴</FRC>
                {priv.description ? (
                    <Tooltip
                        title={
                            <div
                                style={{
                                    padding: "8px 12px",
                                    backgroundColor: "#333",
                                    color: "#fff",
                                    borderRadius: 4,
                                    maxWidth: 300,
                                }}
                            >
                                {priv.description}
                            </div>
                        }
                        arrow>
                        <FRC rounded={1} px={2} py={0.5} color={'#fff'}
                             bg={priv.color || plt.text.accent}>
                            {priv.name}
                        </FRC>
                    </Tooltip>
                ) : (
                    <FRC rounded={1} px={2} py={0.5} color={'#fff'}
                             bg={priv.color || plt.text.accent}>
                        {priv.name}
                    </FRC>
                )}
            </FRBC>
        </FRSC>
    );
};

export default PrivilegeItem;
