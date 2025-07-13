export interface IFormat {
    id: number;
    name: string;
    icon?: string;
}

export interface IParameter {
    id: number;
    name: string;
    type: 'bool' | 'int' | 'str' | 'select';
    unit?: string | null;
    options?: string[] | null;
}

export interface IConversion {
    id: number;
    input_file: string;
    output_file?: string | null;
    source_format: number;
    target_format: number;
    params: Record<string, any>;
    is_done: boolean;
}
