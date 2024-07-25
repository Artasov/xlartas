import React, {useEffect, useState} from 'react';
import {Button, ButtonGroup, Typography} from '@mui/material';
import SoftwareLogoTitle from "./SoftwareLogoTitle";
import DynamicForm from "../../core/components/elements/DynamicForm";
import axiosInstance from "../../core/components/auth/axiosConfig";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../core/components/auth/useAuth";
import {Message} from "../../core/components/Message";
import {ErrorProcessing} from "../../core/components/ErrorProcessing";
import {useStyles} from "../../core/components/Theme/useStyles";

const SoftwareBuySubscription = ({software_obj, software_name, setIsSubscribe}) => {
    const {user, isAuthenticated, showLoginModal, updateCurrentUser, frontendLogout} = useAuth();
    const [software, setSoftware] = useState(null);
    const [selectedSubscriptionId, setSelectedSubscriptionId] = useState(null);
    const [error, setError] = useState({});
    const navigate = useNavigate();
    const classes = useStyles();

    useEffect(() => {
        if (software_obj) {
            setSoftware(software_obj);
        } else {
            axiosInstance.get(`/api/software/${software_name}`)
                .then(response => {
                    setSoftware(response.data);
                    console.log(software)
                })
                .catch(error => {
                    setSoftware(false);
                    ErrorProcessing.byResponse(error, frontendLogout);
                });
        }
    }, [software_name, software_obj]);

    const handleSubscriptionSelect = (subscriptionId) => {
        setSelectedSubscriptionId(subscriptionId);
    };

    const handleBuySubmit = async (setErrors) => {
        setError({});
        if (!isAuthenticated) {
            ErrorProcessing.notAuthentication(showLoginModal);
        }
        try {
            await axiosInstance.post('/api/software/subscribe/', {
                software_subscription_id: selectedSubscriptionId,
            });
            updateCurrentUser();
            setIsSubscribe(true);
            setTimeout(() => {
                navigate('/');
                Message.success('Congratulations! You have successfully subscribed.', 7000)
            }, 310);
        } catch (error) {
            ErrorProcessing.byResponse(error, frontendLogout);
        }
    };

    if (!software) return <div>Loading...</div>;
    if (software === false) return <div>Failed to load software details.</div>;

    return (
        <DynamicForm className={`fccc pb-3`}
                     requestFunc={handleBuySubmit}
                     loadingClassName={`${classes.textPrimary80} ${classes.bgPrimary30}`}
                     submitBtnClassName={`${classes.bgContrast80} ${classes.textContrast80} 
                                          fw-7 w-min text-nowrap mx-auto`}
                     submitBtnText={'Confirm purchase'}>
            <SoftwareLogoTitle
                titleClassName={'fs-1 m-0 mt-1'}
                className={'frsc gap-2 px-3 mt-3 mb-2'}
                software={software}
                size={45}/>
            {software.subscriptions.length > 0
                ?
                <div style={{width: "99%"}}>
                    <ButtonGroup className={'fc gap-1 mb-2 mt-1 w-100'}
                                 aria-label="outlined primary button group"
                                 sx={{mb: 2}}>
                        {software.subscriptions.map((subscription) => (
                            <Button
                                key={subscription.id}
                                onClick={() => handleSubscriptionSelect(subscription.id)}
                                className={`
                                        ${selectedSubscriptionId === subscription.id
                                    ? `${classes.textContrast80} fw-6 ${classes.bgContrast80}`
                                    : `${classes.textPrimary50} ${classes.bgPrimary50}`} 
                                        rounded-2 border-0 transition-d-300 transition-all
                                `}>
                                {subscription.name} - {subscription.amount}₽
                            </Button>
                        ))}
                    </ButtonGroup>
                    <Typography variant="caption" display="block" className={`text-center ${classes.textPrimary40}`}>
                        From your account will be
                        charged {selectedSubscriptionId ? software.subscriptions.find(
                        sub => sub.id === selectedSubscriptionId)?.amount : 0}&nbsp;₽
                    </Typography>
                </div>
                :
                <div className={'text-center'}>
                    <Typography variant="caption" display="block"
                                className={`fs-6 text-center px-4 ${classes.textPrimary75}`}>
                        Unfortunately, it is not yet possible to subscribe to this product.
                    </Typography>
                </div>
            }
            <div className={`fccc fs-7 ${classes.textPrimary40} mb-2`}>
                <button className={'fw-bold'} onClick={() => navigate('/offer')}>
                    Оферта
                </button>
                <button className={'fw-bold'} onClick={() => navigate('/terms-and-conditions')}>
                    Условия использования
                </button>
                <button className={'fw-bold'} onClick={() => navigate('/privacy-policy')}>
                    Политика конфиденциальности
                </button>
            </div>
        </DynamicForm>
    );
};

export default SoftwareBuySubscription;
