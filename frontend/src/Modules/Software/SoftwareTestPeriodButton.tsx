// Modules/Software/SoftwareTestPeriodButton.tsx
import React, {useContext, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button} from "@mui/material";
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
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

const SoftwareTestPeriodButton: React.FC<SoftwareTestPeriodButtonProps> = (
    {
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
    const {t} = useTranslation();
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
            Message.error(t('test_activation_error'));
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
            >
                <DialogContent>
                    <FCC maxW={300} g={1}>
                        <p style={{textAlign: 'center', margin: 0}}>Вы можете активировать тестовый период
                            продолжительностью {testPeriodDays} дней.</p>
                        <p style={{textAlign: 'center', margin: 0}}>Активировать тестовый период?</p>
                        <FRCC g={1}>
                            <Button onClick={handleActivate} disabled={isLoading} sx={{width: '100%', fontWeight: 700}}>
                                {isLoading ? 'Активируется...' : 'Подтвердить'}
                            </Button>
                            {/*<Button onClick={() => setIsModalOpen(false)}>*/}
                            {/*    Отмена*/}
                            {/*</Button>*/}
                        </FRCC>
                    </FCC>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default SoftwareTestPeriodButton;
