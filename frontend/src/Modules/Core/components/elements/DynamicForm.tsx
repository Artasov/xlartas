// Modules/Core/components/elements/DynamicForm.tsx

import React, {ReactNode, useState} from 'react';
import {FormControl, TextField} from '@mui/material';
import Button from "Core/components/elements/Button/Button";

interface DynamicFormProps {
    children: ReactNode;
    className?: string;
    requestFunc: (() => Promise<void>) | (() => void);
    submitBtnText: string;
    submitBtnClassName?: string;
    submitDisabled?: boolean;
}

const DynamicForm: React.FC<DynamicFormProps> = (
    {
        children,
        className = '',
        requestFunc,
        submitBtnText,
        submitBtnClassName = '',
        submitDisabled = false,
    }
) => {
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (submitDisabled) return;
        setLoading(true);
        try {
            await requestFunc();
        } catch (error) {
            console.log('Ошибка обработки динамической формы');
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const clonedChildren = React.Children.map(children, child => {
        if (!React.isValidElement<any>(child)) return child;
        if (child.type === TextField) {
            return React.cloneElement(child, {
                disabled: loading,
                helperText: child.props.helperText,
            });
        }
        return React.cloneElement(child, {
            disabled: loading,
        });
    });

    return (
        <div className={`fcc ${className}`}>
            {clonedChildren}
            <FormControl>
                <Button
                    onClick={handleSubmit}
                    type="button"
                    disabled={loading || submitDisabled}
                    className={submitBtnClassName}
                    loading={loading}
                >
                    {loading ? 'Загрузка...' : submitBtnText}
                </Button>
            </FormControl>
        </div>
    );
};

export default DynamicForm;
