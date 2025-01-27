import {IClient} from "types/commerce/client";


export interface IUser {
    id: number;
    username?: string;
    email?: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    birth_date?: string; // дата
    date_joined?: string;
    gender?: 'male' | 'female';
    avatar?: string;
    timezone?: string;
    is_email_confirmed?: boolean;
    is_staff?: boolean;
    is_phone_confirmed?: boolean;
    is_password_exists?: boolean;
    is_test?: boolean;
    age?: number;
    client?: IClient | null;
    full_name?: string;
}

export interface IDiscordUser {
    id: number
    user: IUser;
}
