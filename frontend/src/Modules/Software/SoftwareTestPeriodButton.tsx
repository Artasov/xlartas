// Modules/Software/SoftwareTestPeriodButton.tsx
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button} from "@mui/material";
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import {FCC, FRCC} from "wide-containers";
import {useSoftwareApi} from 'Software/useSoftwareApi';
import {Message} from "Core/components/Message";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {useTheme} from "Theme/ThemeContext";
import {useAuth} from "Auth/AuthContext";
import {useNavigate} from "Utils/nextRouter";
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
    const {isAuthenticated} = useAuth();
    const {activateTestPeriod} = useSoftwareApi();
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
            const response = await activateTestPeriod(softwareId);
            Message.success(response.detail || t('test_activation_success'));
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
                <span>{t('test_period_completed')}</span>
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
                {t('free_days', {days: testPeriodDays})}
            </FRCC>
            <Dialog
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            >
                <DialogContent>
                    <FCC maxW={300} g={1}>
                        <p style={{textAlign: 'center', margin: 0}}>
                            {t('you_can_activate_test_period', {days: testPeriodDays})}
                        </p>
                        <p style={{textAlign: 'center', margin: 0}}>
                            {t('activate_test_period_question')}
                        </p>
                        <FRCC g={1}>
                            <Button onClick={handleActivate} disabled={isLoading} sx={{width: '100%', fontWeight: 700}}>
                                {isLoading ? t('activating') : t('confirm')}
                            </Button>
                        </FRCC>
                    </FCC>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default SoftwareTestPeriodButton;
