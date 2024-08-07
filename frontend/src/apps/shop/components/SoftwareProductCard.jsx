import React, {useContext, useState} from 'react';
import {timeAgo} from "../../core/services/base/timeAgo";
import {Button, CircularProgress} from "@mui/material";
import Modal from "../../core/components/elements/Modal/Modal";
import {useNavigate} from "react-router-dom";
import {AuthContext} from "../../core/components/auth/AuthContext";
import axiosInstance from "../../core/components/auth/axiosConfig";
import SoftwareBuySubscription from "./SoftwareBuySubscription";
import SoftwareImage from "./SoftwareImage";
import SoftwareLogoTitle from "./SoftwareLogoTitle";
import DynamicForm from "../../core/components/elements/DynamicForm";
import {Message} from "../../core/components/Message";
import {ErrorProcessing} from "../../core/components/ErrorProcessing";
import {useStyles} from "../../core/components/Theme/useStyles";
import FeedIcon from '@mui/icons-material/Feed';
import YouTubeIcon from '@mui/icons-material/YouTube';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import TimelapseIcon from '@mui/icons-material/Timelapse';

const SoftwareProductCard = ({software}) => {
    const {isAuthenticated, showLoginModal, frontendLogout} = useContext(AuthContext);
    const navigate = useNavigate();
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
    const [isChangeLogModalOpen, setIsChangeLogModalOpen] = useState(false);
    const [isTestPeriodModalOpen, setIsTestPeriodModalOpen] = useState(false);
    const [isTestPeriodActivate, setIsTestPeriodActivate] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isDownloadInProgress, setIsDownloadInProgress] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const classes = useStyles();
    const handleClickOpenPayModal = () => {
        if (!isAuthenticated) {
            ErrorProcessing.notAuthentication(showLoginModal);
            return;
        }
        setIsSubscribeModalOpen(true);
    }
    const handleClickOpenTestPeriodModal = () => {
        if (!isAuthenticated) {
            ErrorProcessing.notAuthentication(showLoginModal);
            return;
        }
        setIsTestPeriodModalOpen(true);
    }
    const handleTestPeriodActivate = async (softwareId) => {
        if (!isAuthenticated) {
            ErrorProcessing.notAuthentication(showLoginModal);
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
        } catch (error) {
            ErrorProcessing.byResponse(error, frontendLogout);
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
            Message.success(`File ${fileName} successfully downloaded to your computer.`)
            const blobUrl = window.URL.createObjectURL(data);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(link);
        } catch (error) {
            ErrorProcessing.byResponse(error, frontendLogout);
        } finally {
            setIsDownloadInProgress(false);
        }
    };

    return (<div className={`fc gap-2 ${classes.bgContrast10} p-3 rounded-2 flex-grow-1`}>
        <div className={'fr gap-3'}>
            <div className={'fcs gap-3'}>
                <SoftwareImage size={95} url={software.img}/>
                <div className={`${classes.textPrimary75} 
                                grid-2x2 fs-2 column-gap-sm-1 column-gap-0 row-gap-1`}
                     style={{marginLeft: 2, padding: '0 0.6rem'}}>
                    <div className={'fccc'} style={{width: '1em', height: '1em'}}>
                        <FeedIcon style={{fontSize: '1em'}}
                                  className={`${classes.textPrimary65} hover-scale-5`}
                                  onClick={() => {
                                      setIsInfoModalOpen(true)
                                  }}/>
                        <Modal
                            className={`${classes.textPrimary80} ${classes.bgPrimary55} ${classes.boxShadowMO06}
                                        rounded-4 fs-6 mw-450px transition-all transition-d-300`}
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
                        <TimelapseIcon style={{fontSize: '1em'}}
                                       className={`${classes.textPrimary65} hover-scale-5`}
                                       onClick={() => {
                                           setIsChangeLogModalOpen(true)
                                       }}/>
                        <Modal
                            className={`${classes.textPrimary80} ${classes.bgPrimary55} ${classes.boxShadowMO06} 
                                        fs-6 mw-450px rounded-4 transition-all transition-d-300`}
                            isOpen={isChangeLogModalOpen}
                            onClose={() => {
                                setIsChangeLogModalOpen(false)
                            }}>
                            <div className={'p-4 mh-80vh fc gap-4'}>
                                <SoftwareLogoTitle
                                    titleClassName={'fs-1 m-0'}
                                    className={'frsc gap-2'}
                                    software={software}
                                    size={60}/>
                                <p className={'px-1'} dangerouslySetInnerHTML={{__html: software.log_changes}}></p>
                            </div>
                        </Modal>
                    </div>
                    <a className={`${software.review_url ? '' : 'opacity-25'} fccc`}
                       rel={'noopener noreferrer'} target={'_blank'}
                       style={{width: '1em', height: '1em'}}
                       href={software.review_url}>
                        <YouTubeIcon style={{fontSize: "1em"}} className={`${classes.textPrimary65} hover-scale-5`}/>
                    </a>
                    <div className={'fccc'} style={{width: '1em', height: '1em', fontSize: '.9em'}}>
                        <CloudDownloadIcon style={{fontSize: '1em'}}
                                           className={`${classes.textPrimary65} hover-scale-5 ${isDownloadInProgress ? 'pointer-events-none opacity-25' : ''}`}
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
                                          className={`${classes.textPrimary75}`}
                                          value={downloadProgress}/>
                    </div>
                </div>
            }
            <div className={'fcb w-100 pt-1 gap-2'} style={{paddingBottom: 3}}>
                <div className={'fc'}>
                    <h3 className={`m-0 ${classes.textPrimary80}`}>
                        {software.name}
                    </h3>
                    <div className={'fc gap-1'}>
                        <p className={'fc'}>
                            <span>
                                <span className={''}>Version: </span>
                                <span className={`${classes.textPrimary65}`}>{software.version}</span>
                            </span>
                            <span>
                                <span className={''}>Updated: </span>
                                <span className={`${classes.textPrimary65}`}>{timeAgo(software.updated_at)}</span>
                            </span>
                            <span>
                                <span className={''}>Starts: </span>
                                <span className={`${classes.textPrimary65}`}>{software.starts}</span>
                            </span>
                        </p>
                    </div>
                </div>
                <div className={'w-100 fc gap-2 fs-6'}>
                    <Button
                        className={`
                                        transition-all transition-tf-eio transition-d-300 fw-4 backdrop-saturate-2
                                        py-0 frcc ${classes.bgContrast15} ${classes.textPrimary80}
                                    `}
                        type="button"
                        onClick={handleClickOpenTestPeriodModal}>
                        <span style={{marginTop: 1}}>Free test period</span>
                    </Button>
                    <Modal
                        className={`${classes.textPrimary80} ${classes.bgPrimary30} ${classes.boxShadowMO06}
                                        transition-all transition-d-300 rounded-4 fs-6 mw-450px 
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
                                         loadingClassName={`${classes.textPrimary80} ${classes.bgPrimary30}`}
                                         submitBtnClassName={`${classes.bgContrast80} ${classes.textContrast80} 
                                                              fw-7 w-min text-nowrap mx-auto`}
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
                        className={`${classes.bgContrast15} ${classes.textPrimary80} 
                                      transition-all transition-tf-eio transition-d-300 fw-4
                                      backdrop-saturate-2 py-0 frcc`}
                        type="button"
                        onClick={handleClickOpenPayModal}>
                        <span style={{marginTop: 1}}>Subscribe</span>
                    </Button>
                    <Modal
                        className={`${classes.textPrimary80} ${classes.bgPrimary30} ${classes.boxShadowMO06}
                                        transition-all transition-d-300 rounded-4 fs-6 mw-450px
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