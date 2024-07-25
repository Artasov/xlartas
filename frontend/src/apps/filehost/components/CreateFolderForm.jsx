import React, {useState} from 'react';
import {Button, TextField} from '@mui/material';
import axiosInstance from '../../core/components/auth/axiosConfig';
import {ErrorProcessing} from '../../core/components/ErrorProcessing';
import {useAuth} from '../../core/components/auth/useAuth';
import {useStyles} from "../../core/components/Theme/useStyles";

const CreateFolderForm = ({onClose, onCreate, parentId}) => {
    const {frontendLogout, forceLogin} = useAuth();
    const [name, setName] = useState('');
    const classes = useStyles();

    const handleCreateFolder = async () => {
        try {
            const response = await axiosInstance.post('/api/host/folder/add/', {
                name, parent_id: parentId
            });
            onClose();
            onCreate(response.data)
        } catch (error) {
            ErrorProcessing.byResponse(error, forceLogin);
        }
    };

    return (<div className="create-folder-form fc gap-2">
        <TextField
            fullWidth
            label="New Folder Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
        />
        <Button className={`${classes.textContrast95} ${classes.bgContrast85}`} onClick={handleCreateFolder}>
            Create
        </Button>
    </div>);
};

export default CreateFolderForm;
