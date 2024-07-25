import React, {useEffect, useState} from 'react';
import {Button, Checkbox, CircularProgress, FormControlLabel, TextField} from '@mui/material';
import axiosInstance from '../../core/components/auth/axiosConfig';
import {Message} from '../../core/components/Message';
import {ErrorProcessing} from '../../core/components/ErrorProcessing';
import DeleteIcon from "@mui/icons-material/Delete";
import {useStyles} from "../../core/components/Theme/useStyles";
import {useAuth} from "../../core/components/auth/useAuth";
import {AuthContext} from "../../core/components/auth/AuthContext";
import AddSurveyAccessModal from "./AddSurveyAccessModal";
import Modal from "../../core/components/elements/Modal/Modal";

const SurveyAccessEdit = ({survey, onSlugUpdate}) => {
    const {frontendLogout} = useAuth(AuthContext);
    const [isLoading, setIsLoading] = useState(true);
    const [accesses, setAccesses] = useState([]);
    const [isAddAccessModalOpen, setIsAddAccessModalOpen] = useState(false);
    const [isAccessEditModalOpen, setIsAccessEditModalOpen] = useState(true);
    const [newSlug, setNewSlug] = useState(survey.slug);
    const [isPublic, setIsPublic] = useState(survey.is_public);
    const classes = useStyles();

    useEffect(() => {
        const fetchAccesses = async () => {
            try {
                const response = await axiosInstance.get(`/api/surveys/survey/accesses/?survey_id=${survey.id}`);
                setAccesses(response.data);
                setIsLoading(false);
            } catch (error) {
                ErrorProcessing.byResponse(error, frontendLogout);
                setIsLoading(false);
            }
        };
        fetchAccesses();
    }, [survey.id]);

    const handleUpdateSlug = async () => {
        try {
            await axiosInstance.put('/api/surveys/survey/update/', {
                survey_id: survey.id, slug: newSlug, is_public: isPublic
            });
            Message.success('Link and visibility updated successfully.');
            onSlugUpdate(survey.id, newSlug);
        } catch (error) {
            ErrorProcessing.byResponse(error, frontendLogout);
        }
    };

    const handleDeleteAccess = async (accessId) => {
        try {
            await axiosInstance.delete('/api/surveys/survey/access/delete/', {
                data: {access_id: accessId}
            });
            setAccesses(accesses.filter(access => access.id !== accessId));
            Message.success('Access removed successfully.');
        } catch (error) {
            ErrorProcessing.byResponse(error, frontendLogout);
        }
    };
    const handleOpenAddAccessModal = () => {
        setIsAddAccessModalOpen(true);
        setIsAccessEditModalOpen(false);
    };

    const handleAccessAdded = () => {
        setIsAddAccessModalOpen(false);
        setIsAccessEditModalOpen(true);
    };
    if (isLoading) return <CircularProgress size={50}/>;
    return (
        <div className={'fc'}>
            {isAccessEditModalOpen && (
                <div className={'fc gap-2'}>
                    <h4>Настройки доступа</h4>
                    <span style={{color: '#80a0ff'}}
                          className={'mb-2 user-select-all'}>
                            {`${window.location.origin}/surveys/${newSlug}`}
                    </span>
                    <TextField
                        fullWidth
                        label="Ссылка"
                        value={newSlug}
                        onChange={(e) => setNewSlug(e.target.value)}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                            />
                        }
                        label="Публичный"
                    />
                    <Button className={`${classes.textContrast95} ${classes.bgContrast85}`}
                            onClick={handleUpdateSlug}>
                        Сохранить
                    </Button>
                    {accesses && (
                        <h5 className={'mb-0 mt-2'}>Существующие доступы</h5>
                    )}
                    {accesses.map(access => (
                        <div key={access.id} className={`frbc gap-2 rounded-2 p-2 ps-3 ${classes.bgContrast10}`}>
                            <span>{access.user.email}</span>
                            <DeleteIcon onClick={() => handleDeleteAccess(access.id)}/>
                        </div>
                    ))}
                    <Button className={`${classes.textContrast95} ${classes.bgContrast85}`}
                            onClick={handleOpenAddAccessModal}>
                        Добавить доступ
                    </Button>
                </div>

            )}
            <Modal className={'w-100 mw-300px'} isOpen={isAddAccessModalOpen} onClose={() => {
                setIsAddAccessModalOpen(false)
                setIsAccessEditModalOpen(true);
            }}>
                <AddSurveyAccessModal
                    surveyId={survey.id}
                    onClose={handleAccessAdded}
                    onAccessAdded={handleAccessAdded}
                    setIsAccessEditModalOpen={setIsAccessEditModalOpen}/>
            </Modal>
        </div>
    );
};

export default SurveyAccessEdit;
