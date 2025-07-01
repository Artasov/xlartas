// Modules/Core/components/elements/DynamicForm.tsx
import React, {ReactNode, useState} from 'react';
import {useTranslation} from 'react-i18next';
import pprint from 'Utils/pprint';
import {Message} from 'Core/components/Message';
import {Button, FormControl, TextField} from '@mui/material';

interface DynamicFormProps {
    children: ReactNode;
    className?: string;
    requestFunc: (() => Promise<void>) | (() => void);
    submitBtnText: string;
    submitBtnClassName?: string;
    submitDisabled?: boolean;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
                                                     children,
                                                     className = '',
                                                     requestFunc,
                                                     submitBtnText,
                                                     submitBtnClassName = '',
                                                     submitDisabled = false,
                                                 }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const {t} = useTranslation();

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (submitDisabled) return;
        setLoading(true);
        try {
            await requestFunc();
        } catch (error) {
            pprint('Ошибка обработки динамической формы');
            pprint(error);
            Message.error(t('form_processing_error'));
        } finally {
            setLoading(false);
        }
    };

    const clonedChildren = React.Children.map(children, child => {
        if (!React.isValidElement(child)) {
            return child;
        }

        // Если это MUI TextField, приводим его к корректному типу, чтобы получить доступ к helperText и disabled
        if (child.type === TextField) {
            const textField = child as React.ReactElement<React.ComponentProps<typeof TextField>>;
            return React.cloneElement(textField, {
                disabled: loading,
                helperText: textField.props.helperText,
            });
        }

        // Для любых других компонентов с пропсом `disabled`
        const generic = child as React.ReactElement<{ disabled?: boolean }>;
        return React.cloneElement(generic, {
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
