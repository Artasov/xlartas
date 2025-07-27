// Types/commerce/client.ts
import {IUser} from "types/core/user";

export interface IBitrixClient {
    id: number
    user: IUser; // Типизируйте `IUser` в соответствии с моделью `User`
    bitrix24_contact_id?: number;
    bitrix24_deal_id?: number;
}

export interface IClient {
    id: number
    about_me: string;
    user: IUser;
    status: 'new' | 'planning' | 'beginning' | 'active' | 'continuing' | 'flickering' | 'dissatisfied' | 'former' | 'disappear' | 'rejection' | 'undefined';
    balance: number;
}

export interface ILegalInfo {
    document?: string;
    legal_type?: 'self_employed' | 'individual_entrepreneur';
    bank_bik?: string;
    bank_name?: string;
    corr_account?: string;
    balance_account?: string;
    passport_series?: string;
    passport_number?: string;
    passport_issuer?: string;
    passport_issued_at?: string; // дата
    passport_issuer_code?: string;
    address?: string;
    legal_address?: string;
    inn?: string;
    ogrn?: string;
}

export interface IEmployee extends ILegalInfo {
    id: number
    status: 'new' | 'working' | 'not_working';
    education: string;
    experience_text: string;
    experience_start: Date;
    languages: 'RUS' | 'ENG';
    is_employed: boolean;
}

export interface IEmployeeAvailabilityInterval {
    id: number
    user: IUser;
    start: string; // дата и время
    end: string; // дата и время
}

export interface IEmployeeLeave {
    id: number
    user: IUser;
    leave_type: 'sick' | 'maternity' | 'unpaid';
    start: string; // дата
    end: string; // дата
    reason?: string;
}
