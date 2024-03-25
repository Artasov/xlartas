import React, {useEffect, useRef, useState} from 'react';
import {AuthContext} from "../../components/base/auth/AuthContext/AuthContext";
import SignUpForm from "../../components/base/auth/SignUpForm";
import axiosInstance from "../../services/base/axiosConfig";
import {timeAgo} from "../../services/base/timeAgo";
import {Button, CircularProgress} from "@mui/material";
import {useNavigate} from "react-router-dom";
import UserAvatar from "../../components/base/user/UserAvatar/UserAvatar";
import SoftwareImage from "../Software/SoftwareImage";
import Modal from "../../components/base/elements/Modal/Modal";
import Deposit from "../../components/base/Payment/Deposit";
import {useAuth} from "../../components/base/auth/useAuth";
import Head from "../../components/base/Head";
import {Message} from "../../components/base/Message";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import UsernameEditable from "../../components/base/user/UsernameEditable";
import {faCircleCheck} from "@fortawesome/free-regular-svg-icons/faCircleCheck";

const Home = () => {
    const {user, isAuthenticated, showLoginModal, updateCurrentUser, discord_oauth2} = useAuth(AuthContext);
    const [subscriptions, setSubscriptions] = useState([]);
    const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [errorSubscriptions, setErrorSubscriptions] = useState('');
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const copySecretKeyBtnRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (window.location.search && !window.localStorage.getItem("access")) {
            let urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get("code")) {
                discord_oauth2(urlParams.get("code"))
            }
        }
    })

    useEffect(() => {
        if (isAuthenticated) {
            setLoadingSubscriptions(true);
            axiosInstance.get('/api/subs/current_user/')
                .then(response => {
                    setSubscriptions(response.data.subscriptions);
                    setLoadingSubscriptions(false);
                })
                .catch(error => {
                    console.error('Error fetching subscriptions:', error);
                    setErrorSubscriptions('Failed to load subscriptions.');
                    setLoadingSubscriptions(false);
                });
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) {
            setLoadingOrders(true);
            axiosInstance.get('/api/current_user_orders/')
                .then(response => {
                    setOrders(response.data.orders);
                    setLoadingOrders(false);
                })
                .catch(e => {
                    Message.errorsByData(e.response.data)
                    setLoadingOrders(false);
                });
        }
    }, [isAuthenticated]);


    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            copySecretKeyBtnRef.current.classList.add('backdrop-saturate-4');
            setTimeout(() => {
                copySecretKeyBtnRef.current.classList.remove('backdrop-saturate-4');
            }, 300);
        });
    };

    const handleSubscriptionClick = (softwareName) => {
        navigate(`/software/${softwareName}/`);
    };

    const renderOrders = () => {
        if (loadingOrders) {
            return (<div className="fccc"
                         style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px'}}>
                <CircularProgress size={60}/>
            </div>);
        }
        if (orders.length === 0) {
            return <p>You have not performed any activity on your account yet.</p>;
        }
        const formatDate = (timestamp) => {
            const date = new Date(timestamp * 1000);
            return date.toLocaleDateString('en-GB'); // Formats date as DD-MM-YYYY
        };
        return (orders && orders.length > 0 ? (<div>
            {orders.map((order, index) => (
                <div key={index}
                     className={'frsc gap-2 my-2 py-2 pe-3 ps-2 bg-black-25 rounded hover-scale-2 text-white-75'}>
                    <p className={'pt-1px fs-3 frcc'}>
                        {(order.is_completed) ?
                            <FontAwesomeIcon icon={faCircleCheck} className={'hover-scale-5 text-success'}/> :
                            <FontAwesomeIcon icon={faCircleCheck} className={'hover-scale-5'}/>}
                    </p>
                    <p className={'pt-2px frcc me-auto'} style={{textTransform: 'uppercase'}}>{order.type}</p>
                    <p className={`pt-2px frcc 
                    ${order.type === 'deposit' && order.is_completed ? 'text-success' : ''}
                    ${order.type === 'software' && order.is_completed ? 'text-danger fw-bold' : ''}
                    ${!order.is_completed ? 'text-white-75' : ''}
                    `}>
                        {order.type === 'deposit' && order.is_completed ? '+' : ''}
                        {order.type === 'software' && order.is_completed ? '-' : ''}
                        {order.amount}
                    </p>
                    <p className={'pt-2px frcc'}>{formatDate(order.created_at_timestamp)}</p>
                </div>))}
        </div>) : (<p className={'ti-1'}>
            <span>You have not performed any activity on your account yet, select in the section </span>
            <span onClick={() => navigate('/software')}
                  className={'fw-6 cursor-pointer text-black-d0 bg-white-90 px-2 rounded-2'}>software</span>
        </p>));
    }
    const renderSubscriptions = () => {
        if (loadingSubscriptions) {
            return (<div className="fccc"
                         style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px'}}>
                <CircularProgress size={60}/>
            </div>);
        }

        if (errorSubscriptions) {
            return <div className="fccc">{errorSubscriptions}</div>;
        }

        if (subscriptions.length === 0) {
            return <p>No active subscriptions. Choose a subscription in our catalog.</p>;
        }

        return (subscriptions && subscriptions.length > 0 && subscriptions.some(sub => sub.remaining_hours > 0) ? subscriptions.map((subscription, index) => (subscription.remaining_hours > 0 ? (
            <div key={index}
                 onClick={() => handleSubscriptionClick(subscription.software.name)}
                 className="fr gap-2 my-2 py-2 pe-3 ps-2 bg-black-25 rounded hover-scale-2">
                <SoftwareImage size={50} url={subscription.software.img}/>
                <div className={'fcb w-100'}>
                    <span className={'fs-5 fw-6'}>{subscription.software.name}</span>
                    <div className={'frb text-white-70'}>
                        <span>{subscription.remaining_hours} hours</span>
                        <span>{timeAgo(subscription.last_activity)}</span>
                    </div>
                </div>
            </div>) : null)) : (<p className={'ti-1'}>
            <span>You do not have active subscriptions yet, select in the section </span>
            <span onClick={() => navigate('/software')}
                  className={'fw-6 cursor-pointer text-black-d0 bg-white-90 px-2 rounded-2'}>software</span>
        </p>));
    }


    return (<div className={'mt-2'} style={{maxWidth: 400, margin: 'auto'}}>
        <Head title={`${isAuthenticated ? user.username : 'xl'}`}/>
        <div className={'w-90 mx-auto'}>
            {!isAuthenticated ? (<div>
                <h1 className={'fw-1 fs-07'}>Welcome</h1>
                <p className={'mb-2'}>
                    <span>Create an account to use our services or </span>
                    <span onClick={showLoginModal}
                          className={'text-nowrap px-2 fs-6 bg-white-b0 rounded-3 fw-8 text-black-d5 cursor-pointer'}>
                                sign in
                            </span>
                </p>
                {/*<Alert className={'bg-danger bg-opacity-10 mt-3'} severity="error">*/}
                {/*    Внимание! Авторизация через Google, Telegram пока не работает в связи с переносом сайта*/}
                {/*    на другой хостинг и реализацией single page application. Если у вас были подписки*/}
                {/*    и вы не можете войти, напишите мне в личку в tg @artasov. По любым вопросам не стесняемся*/}
                {/*    писать. Спасибо за поддержку проекта, работаю на энтузиазме по факту.*/}
                {/*</Alert>*/}
                <SignUpForm/>
            </div>) : (<div className={'fc gap-2'}>
                <div className={'px-1'}>
                    <div className="logo_container fs-1 frsc gap-2 mb-2"
                         style={{marginTop: 2}}>
                        <UserAvatar width={'1.7em'} height={'1.7em'}
                                    className={user.avatar ? '' : 'invert-80'}
                                    userImage={user.avatar}/>
                        <UsernameEditable username={user.username} className={`
                            ${user.username.length <= 8 ? 'fs-1' : ''}
                            ${user.username.length > 8 && user.username.length <= 10 ? 'fs-2' : ''}
                            ${user.username.length > 10 && user.username.length <= 12 ? 'fs-3' : ''}
                            ${user.username.length > 12 && user.username.length <= 14 ? 'fs-4' : ''}
                            ${user.username.length > 14 && user.username.length <= 18 ? 'fs-5' : ''}
                            ${user.username.length > 18 ? 'fs-6' : ''}
                        `}/>
                    </div>
                </div>
                <div className={'bg-white-25 p-3 rounded-2 pb-2'}>
                    <div className={'frsc gap-2'} style={{paddingBottom: 5}}>
                        <h3 className={'fw-3 m-0'}>Email</h3>
                        <div style={{marginTop: 1}}
                             className={'enable-tap-select-all fw-1 fs-4 text-white-a0 overflow-y-hidden overflow-x-auto no-scrollbar'}>
                            {user.email}
                        </div>
                    </div>
                </div>
                <div className={'bg-white-25 p-3 rounded-2 pb-2'}>
                    <div className={'frbc fw-3 m-0'} style={{paddingBottom: 5}}>
                        <h3 className={'fw-3 mb-0'}>Balance</h3>
                        <span className={'fw-3 frcc gap-1'}>
                                        <span className={`text-white-a5 fs-4`}
                                              style={{marginTop: 1}}>
                                            {Math.floor(user.balance)}
                                        </span>
                                        <span className={'fw-1 fs-5 text-white-a5'}>₽</span>
                                    </span>
                        <Button
                            className={`transition-all transition-tf-eio transition-d-300 fw-4 
                                        backdrop-saturate-2 fs-5 py-0 px-3 frcc bg-white-30 text-white-a5`}
                            type="button"
                            variant="contained"
                            onClick={() => {
                                setIsDepositModalOpen(true)
                            }}
                        >
                            <span style={{marginTop: 2}}>DEPOSIT</span>
                        </Button>
                        <Modal className={`fs-6 mw-350px text-white-d0 rounded-4 bg-black-45 shadow-black-5-90 
                                        transition-all transition-d-300 p-4`}
                               isOpen={isDepositModalOpen}
                               onClose={() => {
                                   setIsDepositModalOpen(false)
                               }}>
                            <Deposit/>
                        </Modal>

                    </div>
                </div>
                <div className={'bg-white-25 p-3 rounded-2'}>

                    <h3 className={'fw-3 mb-2 pb-1'}>Subscriptions</h3>
                    {renderSubscriptions()}
                </div>

                <div className={'bg-white-25 p-3 rounded-2 pb-2'}>
                    <div className={'frsc gap-3'} style={{paddingBottom: 5}}>
                        <Button
                            ref={copySecretKeyBtnRef}
                            className={`
                                        transition-all transition-tf-eio transition-d-300 fw-4 backdrop-saturate-1
                                        fs-5 py-0 frcc flex-grow-1 bg-white-30 text-white-a5
                                    `}
                            type="button"
                            variant="contained"
                            onClick={() => copyToClipboard(user.secret_key)}
                        >
                            <span style={{marginTop: 2}}>Copy Secret Key</span>
                        </Button>
                    </div>
                </div>

                <div className={'bg-white-05 px-3 py-2 rounded-2'}>
                    {renderOrders()}
                </div>
            </div>)}
        </div>
    </div>);
};

export default Home;