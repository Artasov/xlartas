import React, {useEffect, useState} from 'react';
import {Button, ButtonGroup, Typography} from '@mui/material';
import SoftwareLogoTitle from "./SoftwareLogoTitle";
import DynamicForm from "../../components/base/elements/DynamicForm";
import axiosInstance from "../../services/base/axiosConfig";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../components/base/auth/useAuth";
import {Message} from "../../components/base/Message";

const SoftwareBuySubscription = ({software_obj, software_name, setIsSubscribe}) => {
    const {user, isAuthenticated, showLoginModal, updateCurrentUser} = useAuth();
    const [software, setSoftware] = useState(null);
    const [selectedSubscriptionId, setSelectedSubscriptionId] = useState(null);
    const [error, setError] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        if (software_obj) {
            setSoftware(software_obj);
        } else {
            axiosInstance.get(`/api/software/${software_name}`)
                .then(response => {
                    setSoftware(response.data);
                })
                .catch(e => {
                    setSoftware(false);
                    Message.errorsByData(e.response.data)
                });
        }
    }, [software_name, software_obj]);

    const handleSubscriptionSelect = (subscriptionId) => {
        setSelectedSubscriptionId(subscriptionId);
    };

    const handleBuySubmit = async (setErrors) => {
        setError({});
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
        } catch (e) {
            Message.errorsByData(e.response.data);
        }
    };

    if (!software) return <div>Loading...</div>;
    if (software === false) return <div>Failed to load software details.</div>;

    return (
        <DynamicForm className={`fccc pb-3`}
                     requestFunc={handleBuySubmit}
                     loadingClassName={'text-black-c0 '}
                     submitBtnClassName={'fw-7 bg-white-c0'}
                     submitBtnText={'Confirm purchase'}>
            <SoftwareLogoTitle
                titleClassName={'fs-1 m-0 mt-1'}
                className={'frsc gap-2 px-3 mt-3 mb-2'}
                software={software}
                size={45}/>
            <ButtonGroup className={'fc gap-1 mb-2 mt-1 w-100'} variant="contained"
                         aria-label="outlined primary button group"
                         sx={{mb: 2}}>
                {software.subscriptions.map((subscription) => (
                    <Button
                        key={subscription.id}
                        onClick={() => handleSubscriptionSelect(subscription.id)}
                        className={`
                            ${selectedSubscriptionId === subscription.id ? 'text-black-c0 fw-6 bg-white-c0' : 'bg-black-50 text-white-c0'} 
                            rounded-2 border-0 transition-d-300 transition-all
                           `}>
                        {subscription.name} - {subscription.priceRub}₽
                    </Button>
                ))}
            </ButtonGroup>

            <Typography variant="caption" display="block" className={'mb-2 text-white-60'}>
                From your account will be
                charged {selectedSubscriptionId ? software.subscriptions.find(sub => sub.id === selectedSubscriptionId)?.priceRub : 0}&nbsp;₽
            </Typography>
        </DynamicForm>
    );
};

export default SoftwareBuySubscription;
