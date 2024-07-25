import axiosInstance from "../auth/axiosConfig";
import {Message} from "../Message";
import {useAuth} from "../auth/useAuth";
import {AuthContext} from "../auth/AuthContext";
import React, {useRef, useState} from "react";
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from "@mui/icons-material/Done";
import {ErrorProcessing} from "../ErrorProcessing";
import {useStyles} from "../Theme/useStyles";

const UsernameEditable = ({className}) => {
    const {user, isAuthenticated, showLoginModal, frontendLogout} = useAuth(AuthContext);
    const [editing, setEditing] = useState(false);
    const [username, setUsername] = useState(user.username);
    const [editingUsername, setEditingUsername] = useState(user.username);
    const usernameInput = useRef();
    const classes = useStyles();
    const renameMe = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            ErrorProcessing.notAuthentication(showLoginModal);
        }
        if (editingUsername.length === 0) {
            Message.error('Please enter a username.');
            return;
        }

        await axiosInstance.post('/api/rename_current_user/', {
            username: editingUsername,
        }).then(response => {
            setUsername(editingUsername);
            setEditing(false);
            usernameInput.current.blur()
            Message.success(response.data.message);
        }).catch(error => {
            ErrorProcessing.byResponse(error, frontendLogout);
        });
    }
    return (
        <form onSubmit={renameMe} className={'frcc pe-2'}>
            <input value={editingUsername} name={'username'} ref={usernameInput}
                   size={editing ? 0 : username.length - 1}
                   onChange={(e) => {
                       setEditingUsername(e.target.value);
                   }}
                   onFocus={() => {
                       setEditing(true)
                   }}
                   className={`${className} fw-4 ${classes.textPrimary80} mt-1px bg-transparent border-0 outline-none w-100`}/>
            <div className={'frcc'} style={{marginLeft: "-13px"}}>
                {editing
                    ?
                    <div className={'frcc gap-3 pt-2px'}>
                        <DoneIcon className={`hover-scale-5 fs-3 ${classes.textPrimary65}`}/>
                        <CloseIcon className={`hover-scale-5 fs-3 ${classes.textPrimary65}`}
                                   onClick={() => {
                                       setEditing(false);
                                       setEditingUsername(username);
                                   }}/>
                    </div>
                    :
                    <EditIcon onClick={() => usernameInput.current.focus()}
                              className={`hover-scale-5 fs-4 ${classes.textPrimary25}`}/>
                }
            </div>
        </form>
    )
        ;
}

export default UsernameEditable;