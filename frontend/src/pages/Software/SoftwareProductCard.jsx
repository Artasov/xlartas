import React, {useContext, useState} from 'react';
import {timeAgo} from "../../services/base/timeAgo";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBookOpen, faClockRotateLeft, faCloudArrowDown} from "@fortawesome/free-solid-svg-icons";
import {faYoutube} from "@fortawesome/free-brands-svg-icons";
import {Alert, Button, CircularProgress} from "@mui/material";
import Modal from "../../components/base/elements/Modal/Modal";
import {useNavigate} from "react-router-dom";
import {AuthContext} from "../../components/base/auth/AuthContext/AuthContext";
import axiosInstance from "../../services/base/axiosConfig";
import SoftwareBuySubscription from "./SoftwareBuySubscription";
import SoftwareImage from "./SoftwareImage";
import SoftwareLogoTitle from "./SoftwareLogoTitle";
import DynamicForm from "../../components/base/elements/DynamicForm";
import {Message} from "../../components/base/Message";

const SoftwareProductCard = ({software}) => {
    const {isAuthenticated, showLoginModal} = useContext(AuthContext);
    const navigate = useNavigate();
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
    const [isChangeLogModalOpen, setIsChangeLogModalOpen] = useState(false);
    const [isTestPeriodModalOpen, setIsTestPeriodModalOpen] = useState(false);
    const [isTestPeriodActivate, setIsTestPeriodActivate] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isDownloadInProgress, setIsDownloadInProgress] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const handleClickOpenPayModal = () => {
        if (isAuthenticated) {
            setIsSubscribeModalOpen(true);
        } else {
            Message.noAuthentication();
            showLoginModal();
        }
    }
    const handleClickOpenTestPeriodModal = () => {
        if (!isAuthenticated) {
            Message.noAuthentication();
            showLoginModal();
        }
        setIsTestPeriodModalOpen(true);
    }
    const handleTestPeriodActivate = async (softwareId) => {
        if (!isAuthenticated) {
            Message.noAuthentication();
            return;
        }
        try {
            await axiosInstance.post('/api/software/test-activate/', {
                software_id: softwareId,
            }).then((response) => {
                setIsTestPeriodActivate(true);
                Message.success(
                    'Congratulations! You have successfully activated the trial period. Enjoy using it.',
                    7000)
                setTimeout(() => {
                    navigate('/');
                }, 310);
            });
        } catch (e) {
            Message.errorsByData(e.response.data);
        }
    };
    const handleDownloadSoftwareFile = async (fileUrl, softwareName) => {
        if (!fileUrl) {
            Message.error('Software file URL not provided.');
            return;
        }
        setIsDownloadInProgress(true);

        try {
            const response = await fetch(fileUrl);
            if (!response.ok) {
                Message.error('Network response was not ok.');
                return;
            }

            const contentLength = response.headers.get('content-length');
            let receivedLength = 0;
            const reader = response.body.getReader();
            const stream = new ReadableStream({
                async start(controller) {
                    while (true) {
                        const {done, value} = await reader.read();
                        if (done) break;
                        receivedLength += value.length;
                        setDownloadProgress((receivedLength / contentLength) * 100);
                        controller.enqueue(value);
                    }
                    controller.close();
                    reader.releaseLock();
                },
            });

            const data = await new Response(stream).blob();

            const urlSegments = fileUrl.split('/');
            let fileName = urlSegments[urlSegments.length - 1];
            const fileNameParts = fileName.split('.');
            const fileExt = fileNameParts.pop();
            if (fileExt && softwareName) {
                fileName = `${softwareName}.${fileExt}`;
            }

            const blobUrl = window.URL.createObjectURL(data);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(link);
        } catch (e) {
            Message.errorsByData(e.response.data);
        } finally {
            setIsDownloadInProgress(false);
        }
    };

    return (<div className="fc gap-2 bg-white-25 p-3 rounded-2 flex-grow-1">
        <div className={'fr gap-3'}>
            <div className={'fcs gap-3'}>
                <SoftwareImage size={95} url={software.img}/>
                <div className={'grid-2x2 fs-2 px-2 text-white-70 column-gap-sm-2 column-gap-0 row-gap-2'}
                     style={{marginLeft: 2}}>
                    <div className={'fccc'} style={{width: '1em', height: '1em'}}>
                        <FontAwesomeIcon style={{fontSize: '1em'}} icon={faBookOpen} className={'hover-scale-5'}
                                         onClick={() => {
                                             setIsInfoModalOpen(true)
                                         }}/>
                        <Modal className={'fs-6 bg-black-65 mw-450px text-white-d0 text-shadow-black-2-80'}
                               isOpen={isInfoModalOpen}
                               onClose={() => {
                                   setIsInfoModalOpen(false)
                               }}>
                            <div className={'p-4 fc gap-3'}>
                                <SoftwareLogoTitle
                                    titleClassName={'fs-1 m-0'}
                                    className={'frsc gap-2'}
                                    software={software}
                                    size={60}/>
                                <p className={'ti-1'}>{software.desc}</p>
                            </div>
                        </Modal>
                    </div>
                    <div className={'fccc'} style={{width: '1em', height: '1em'}}>
                        <FontAwesomeIcon style={{fontSize: '1em'}} icon={faClockRotateLeft} className={'hover-scale-5'}
                                         onClick={() => {
                                             setIsChangeLogModalOpen(true)
                                         }}/>
                        <Modal className={'fs-6 bg-black-65 mw-450px text-white-d0 text-shadow-black-2-80'}
                               isOpen={isChangeLogModalOpen}
                               onClose={() => {
                                   setIsChangeLogModalOpen(false)
                               }}>
                            <div className={'p-4 fc gap-4'}>
                                <SoftwareLogoTitle
                                    titleClassName={'fs-1 m-0'}
                                    className={'frsc gap-2'}
                                    software={software}
                                    size={60}/>
                                <p className={'px-1'} dangerouslySetInnerHTML={{__html: software.log_changes}}></p>
                            </div>
                        </Modal>
                    </div>
                    <a className={`${software.review_url ? '' : 'opacity-25'} fccc text-white-70`}
                       rel={'noopener noreferrer'} target={'_blank'}
                       style={{width: '1em', height: '1em'}}
                       href={software.review_url}>
                        <FontAwesomeIcon style={{fontSize: "1em"}} icon={faYoutube} className={'hover-scale-5'}/>
                    </a>
                    <div className={'fccc'} style={{width: '1em', height: '1em', fontSize: '.9em'}}>
                        <FontAwesomeIcon style={{fontSize: '1em'}}
                                         icon={faCloudArrowDown}
                                         className={`hover-scale-5 ${isDownloadInProgress ? 'pointer-events-none opacity-25' : ''}`}
                                         onClick={() => {
                                             if (!isDownloadInProgress) handleDownloadSoftwareFile(software.file, software.name);
                                         }}/>
                    </div>
                </div>
            </div>
            {isDownloadInProgress &&
                <div className={'position-absolute left-0 top-0 h-50 w-100 frcc'}>
                    <div className={'bg-black-40 rounded-4 shadow-black-5-90 frc p-3 backdrop-blur-10'}
                         style={{maxWidth: 340, zIndex: 2}}>
                        <CircularProgress variant="determinate" size={80}
                                          className={'text-white-c0'}
                                          value={downloadProgress}/>
                    </div>
                </div>
            }
            <div className={'fcb w-100 pt-1 gap-2'} style={{paddingBottom: 3}}>
                <div className={'fc'}>
                    <h3 className={'m-0 text-white-d0'}>
                        {software.name}
                    </h3>
                    <div className={'fc gap-1'}>
                        <p className={'fc'}>
                            <span>
                                <span className={''}>Version: </span>
                                <span className={'text-white-90'}>{software.version}</span>
                            </span>
                            <span>
                                <span className={''}>Updated: </span>
                                <span className={'text-white-90'}>{timeAgo(software.updated_at)}</span>
                            </span>
                            <span>
                                <span className={''}>Starts: </span>
                                <span className={'text-white-90'}>{software.starts}</span>
                            </span>
                        </p>
                    </div>
                </div>
                <div className={'w-100 fc gap-2 fs-6'}>
                    <Button
                        className={`
                                        transition-all transition-tf-eio transition-d-300 fw-4 backdrop-saturate-2
                                        py-0 frcc bg-white-30 text-white-c5
                                    `}
                        type="button"
                        variant="contained"
                        onClick={handleClickOpenTestPeriodModal}>
                        <span style={{marginTop: 1}}>Free first month</span>
                    </Button>
                    <Modal className={`fs-6 rounded-4 bg-black-45 mw-450px text-white-d0 text-shadow-black-2-80
                                        transition-all transition-d-300
                                        ${isTestPeriodActivate ? 'rotate3dZX-90' : ''}`}
                           isOpen={isTestPeriodModalOpen}
                           onClose={() => {
                               setIsTestPeriodModalOpen(false)
                           }}>
                        <div className={'pb-4 px-3'}>
                            <DynamicForm className={`fccc`}
                                         requestFunc={() => {
                                             handleTestPeriodActivate(software.id)
                                         }}
                                         loadingClassName={'text-black-c0'}
                                         submitBtnClassName={'fw-7 bg-white-c0'}
                                         submitBtnText={'Activate'}>
                                <SoftwareLogoTitle
                                    titleClassName={'fs-1 m-0 mt-1 me-1'}
                                    className={'frsc gap-2 px-3 mt-3 mb-2'}
                                    software={software}
                                    size={45}/>


                                <p className={'fs-6 ti-1 pb-2 pt-1'}>
                                    Once confirmed, you will be given {software.test_period_days} days of subscription.
                                    It will not be possible to undo this action. Are you sure you want to continue?
                                </p>
                            </DynamicForm>
                        </div>
                    </Modal>
                    <Button
                        className={`
                                        transition-all transition-tf-eio transition-d-300 fw-4 backdrop-saturate-2
                                        py-0 frcc bg-white-30 text-white-c5 
                                    `}
                        type="button"
                        variant="contained"
                        onClick={handleClickOpenPayModal}>
                        <span style={{marginTop: 1}}>Subscribe</span>
                    </Button>
                    <Modal className={`fs-6 mw-450px text-white-d0 rounded-4 bg-black-45 shadow-black-5-90 
                                        transition-all transition-d-300
                                        ${isSubscribed ? 'rotate3dZX-90' : ''}`}
                           isOpen={isSubscribeModalOpen}
                           onClose={() => {
                               setIsSubscribeModalOpen(false)
                           }}>
                        <SoftwareBuySubscription software_obj={software} setIsSubscribe={setIsSubscribed}/>
                    </Modal>
                </div>
            </div>
        </div>
    </div>);
};

export default SoftwareProductCard;