// Types/converter/index.ts
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
    default_value?: string | null;
}

export interface IConversion {
    id: number;
    input_file: string;
    output_file?: string | null;
    output_name?: string | null;
    size?: number | null;
    source_format: number;
    target_format: number;
    params: Record<string, any>;
    is_done: boolean;
}

export interface IConvertResult {
    conversion: IConversion;
    remaining: number;
}
