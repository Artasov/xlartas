import axiosInstance from "../../../services/base/axiosConfig";
import {Message} from "../Message";
import {useAuth} from "../auth/useAuth";
import {AuthContext} from "../auth/AuthContext/AuthContext";
import React, {useRef, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck, faClose, faPen} from "@fortawesome/free-solid-svg-icons";
import button from "bootstrap/js/src/button";

const UsernameEditable = ({className}) => {
    const {user, isAuthenticated, showLoginModal} = useAuth(AuthContext);
    const [editing, setEditing] = useState(false);
    const [username, setUsername] = useState(user.username);
    const [editingUsername, setEditingUsername] = useState(user.username);
    const usernameInput = useRef();
    const renameMe = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            Message.noAuthentication(showLoginModal);
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
        }).catch(
            e => Message.errorsByData(e.response.data)
        );
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
                   className={`${className} fw-4 text-white-d0 mt-1px bg-transparent border-0 outline-none w-100`}/>
            <div style={{marginLeft: "-13px"}}>
                {editing
                    ?
                    <div className={'frcc gap-3 pt-2px'}>
                        <button type={'submit'} className={'bg-transparent border-0 fcc'}>
                            <FontAwesomeIcon icon={faCheck} className={'hover-scale-5 fs-3 text-white-a0'}/>
                        </button>
                        <button className={'bg-transparent border-0 fcc'}>
                            <FontAwesomeIcon icon={faClose} className={'hover-scale-5 fs-3 text-white-a0'}
                                             onClick={() => {
                                                 setEditing(false);
                                                 setEditingUsername(username);
                                             }}/>
                        </button>
                    </div>
                    :
                    <button className={'bg-transparent border-0 fcc'}>
                        <FontAwesomeIcon icon={faPen} onClick={() => usernameInput.current.focus()}
                                         className={'hover-scale-5 fs-4 text-white-20'}/>
                    </button>
                }
        </div>
</form>
)
    ;
}

export default UsernameEditable;