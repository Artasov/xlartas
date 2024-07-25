import React, {useEffect, useState} from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField
} from '@mui/material';
import {ChromePicker} from 'react-color';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axiosInstance from '../../core/components/auth/axiosConfig';
import {ErrorProcessing} from '../../core/components/ErrorProcessing';
import {useAuth} from '../../core/components/auth/useAuth';
import Tag from './Tag';
import {useStyles} from "../../core/components/Theme/useStyles";
import Modal from "../../core/components/elements/Modal/Modal";
import File from "./File";

const TagsManager = ({tagsObject: initialTagsObject, onAddTagToObject, onRemoveTagFromObject}) => {
    const {frontendLogout, forceLogin} = useAuth();
    const [userTags, setUserTags] = useState([]);
    const [tagsObject, setTagsObject] = useState(initialTagsObject);
    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState('#ffffff');
    const [showCreateTagModal, setShowCreateTagModal] = useState(false);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [tagToDelete, setTagToDelete] = useState(null);
    const classes = useStyles();

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            const response = await axiosInstance.get('/api/host/tags/user/');
            setUserTags(response.data);
        } catch (error) {
            ErrorProcessing.byResponse(error, frontendLogout);
        }
    };

    const handleCreateTag = async () => {
        try {
            const response = await axiosInstance.post('/api/host/tags/create/', {
                name: newTagName,
                color: newTagColor,
            });
            setUserTags([...userTags, response.data]);
            setNewTagName('');
            setNewTagColor('#ffffff');
            setShowCreateTagModal(false);
        } catch (error) {
            ErrorProcessing.byResponse(error, frontendLogout);
        }
    };

    const handleRemoveTag = async (tag) => {
        console.log(tag)
        try {
            const isFolder = !tagsObject.hasOwnProperty('file');
            await axiosInstance.post('/api/host/tags/remove/', {
                tag_id: tag.id,
                folder_id: isFolder ? tagsObject.id : null,
                file_id: !isFolder ? tagsObject.id : null,
            });
            setTagsObject({
                ...tagsObject,
                tags: tagsObject.tags.filter(t => t.id !== tag.id)
            });
            onRemoveTagFromObject(tagsObject, tag);
        } catch (error) {
            ErrorProcessing.byResponse(error, frontendLogout);
        }
    };

    const handleAddTagToObject = async (tag) => {
        const isFolder = !tagsObject.hasOwnProperty('file');
        try {
            await axiosInstance.post('/api/host/tags/add/', {
                tag_id: tag.id,
                folder_id: isFolder ? tagsObject.id : null,
                file_id: !isFolder ? tagsObject.id : null,
            });
            setTagsObject({
                ...tagsObject,
                tags: [...tagsObject.tags, tag]
            });
            onAddTagToObject(tagsObject, tag);
        } catch (error) {
            ErrorProcessing.byResponse(error, forceLogin);
        }
    };

    const handleTagDelete = (tagId) => {
        setTagToDelete(tagId);
        setOpenConfirmDialog(true);
    };

    const handleConfirmDelete = async () => {
        setOpenConfirmDialog(false);
        try {
            await axiosInstance.post('/api/host/tags/delete/', {
                id: tagToDelete,
            });
            setUserTags(userTags.filter(tag => tag.id !== tagToDelete));
            setTagToDelete(null);
        } catch (error) {
            ErrorProcessing.byResponse(error, frontendLogout);
        }
    };

    return (
        <div className="tags-manager fcsc gap-2">
            <File key={tagsObject.id}
                  item={tagsObject}
                  isSelected={false}
                  onTagClick={handleRemoveTag}
                  className="bgContrast15"
                  type="card"/>
            {/*<div className="tag-list fr flex-wrap gap-1">*/}
            {/*    {tagsObject.tags.length === 0*/}
            {/*        ? <Tag tag={{id: 0, name: 'Have no tag',}}*/}
            {/*               className={`${classes.bgContrast20}`}*/}
            {/*               deleteBtnVisible={false}*/}
            {/*        />*/}
            {/*        : tagsObject.tags.map((tag) => (*/}
            {/*            <Tag key={tag.id} tag={tag} onClick={() => handleRemoveTag(tag)} deleteBtnVisible={false}/>*/}
            {/*        ))}*/}
            {/*</div>*/}
            <Accordion className={'bg-transparent bg-image-none shadow-none mt-2'}>
                <AccordionSummary className={'p-0 mb-3 fs-5'}
                                  expandIcon={<ExpandMoreIcon/>}>
                    <span className={`${classes.textPrimary85}`}>+ tag</span>
                </AccordionSummary>
                <AccordionDetails className={'fc gap-2 p-0'}>
                    <div className="tag-list fr flex-wrap gap-1">
                        {userTags.length === 0
                            ? <Tag tag={{id: 0, name: 'Have no tag', color: '#fff'}}
                                   className={`${classes.bgContrast20}`}
                                   deleteBtnVisible={false}/>
                            : userTags.filter(tag => !tagsObject.tags.some(objTag => objTag.id === tag.id)).map((tag) => (
                                <Tag key={tag.id} tag={tag} deleteBtnVisible={true}
                                     onDelete={() => handleTagDelete(tag.id)}
                                     onClick={() => handleAddTagToObject(tag)}/>
                            ))}
                    </div>
                    <Button className={`${classes.textContrast95} ${classes.bgContrast85}`}
                            onClick={() => setShowCreateTagModal(true)}>
                        Create new Tag
                    </Button>
                </AccordionDetails>
            </Accordion>
            <Modal isOpen={showCreateTagModal} onClose={() => setShowCreateTagModal(false)}>
                <div className={'fc gap-2'}>
                    <TextField
                        fullWidth
                        className={'mt-1'}
                        label="New Tag Name"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                    />
                    <ChromePicker
                        width={'100%'}
                        color={newTagColor}
                        onChangeComplete={(color) => setNewTagColor(color.hex)}
                    />
                    <Button className={`${classes.textContrast95} ${classes.bgContrast85}`} onClick={handleCreateTag}>
                        Create
                    </Button>
                </div>
            </Modal>
            <Dialog open={openConfirmDialog}
                    onClose={() => setOpenConfirmDialog(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>Are you sure you want to delete this tag?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirmDialog(false)} color="primary">Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="primary">Confirm</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default TagsManager;
