// Modules/Software/SoftwareTestPeriodButton.tsx
import React, {useContext, useState} from 'react';
import {Button} from "@mui/material";
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import {FCC, FRCC} from "wide-containers";
import {useApi} from "../Api/useApi";
import {Message} from "Core/components/Message";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {useTheme} from "Theme/ThemeContext";
import {AuthContext, AuthContextType} from "Auth/AuthContext";
import {useNavigate} from "react-router-dom";
import {openAuthModal} from 'Redux/modalsSlice';
import {useDispatch} from "react-redux";

interface SoftwareTestPeriodButtonProps {
    softwareId: number;
    testPeriodDays: number;
    isTested: boolean;
    refreshLicense: () => void;
}

const SoftwareTestPeriodButton: React.FC<SoftwareTestPeriodButtonProps> = ({
                                                                               softwareId,
                                                                               testPeriodDays,
                                                                               isTested,
                                                                               refreshLicense
                                                                           }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const {isAuthenticated} = useContext(AuthContext) as AuthContextType;
    const {api} = useApi();
    const {plt, theme} = useTheme();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleActivate = async () => {
        if (!isAuthenticated) {
            setIsModalOpen(false);
            dispatch(openAuthModal());
            return;
        }
        setIsLoading(true);
        try {
            const response = await api.post(`/api/v1/software/${softwareId}/activate-test-period/`);
            Message.success(response.detail || 'Тестовый период активирован');
            refreshLicense();
            setIsModalOpen(false);
        } catch (error) {
            Message.error('Ошибка активации тестового периода');
        } finally {
            setIsLoading(false);
        }
    };

    if (isTested) {
        return (
            <FCC g={1}>
                <CheckCircleOutlineIcon style={{color: theme.colors.success.main}}/>
                <span>Тестовый период пройден</span>
            </FCC>
        );
    }

    return (
        <>
            <FRCC
                onClick={() => setIsModalOpen(true)}
                cls={'hover-scale-5'}
                rounded={2}
                sx={{
                    width: 'fit-content',
                    color: '#fff',
                    background: plt.text.primary + '33',
                    py: 0,
                    px: 0.9,
                }}
            >
                Free {testPeriodDays} days
            </FRCC>
            <Dialog
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                className="w-100 maxw-380px"
            >
                <DialogTitle>Активация тестового периода</DialogTitle>
                <DialogContent>
                <FCC g={1}>
                    <p>Вы можете активировать тестовый период продолжительностью {testPeriodDays} дней.</p>
                    <p>Хотите активировать тестовый период?</p>
                    <FRCC g={1}>
                        <Button onClick={handleActivate} variant="contained" disabled={isLoading}>
                            {isLoading ? 'Активируется...' : 'Подтвердить'}
                        </Button>
                        <Button onClick={() => setIsModalOpen(false)} variant="outlined">
                            Отмена
                        </Button>
                    </FRCC>
                </FCC>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default SoftwareTestPeriodButton;
