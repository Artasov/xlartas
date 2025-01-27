import {IUser} from "types/core/user";

export interface IRoom {
    id: number
    name?: string;
    participants: IUser[];
    last_message?: IMessage;
    max_participants: number;
}

export interface IChatFile {
    id: number
    file: string
}

export interface IMessage {
    id: number | null
    user: IUser;
    tempId: number | string;
    room: IRoom | number;
    text: string;
    created_at: string;
    status: 'sending' | 'sent';
    is_read?: boolean;
    is_important: boolean;

    files: any;
}

