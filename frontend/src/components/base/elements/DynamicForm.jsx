import React, {useState} from 'react';
import {Alert, Button, CircularProgress, FormControl, TextField} from '@mui/material';

const DynamicForm = ({children, className, requestFunc, submitBtnText, submitBtnClassName, loadingClassName}) => {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            await requestFunc(setErrors).then(() =>{
                setLoading(false);
            });
        } catch (error) {

        }
        setLoading(false);
    };

    const clonedChildren = React.Children.map(children, child => {
        if (!React.isValidElement(child)) return child;

        const {name} = child.props;
        // Проверка, является ли элемент TextField (или другим компонентом, который может иметь свойство helperText)
        if (child.type === TextField) {
            return React.cloneElement(child, {
                disabled: loading,
                error: !!errors[name],
                helperText: errors[name] || child.props.helperText,
            });
        }
        return React.cloneElement(child, {
            disabled: loading,
        });
    });

    return (
        <form className={`fcc gap-1 pt-2 ${className}`} onSubmit={handleSubmit} noValidate>
            {clonedChildren}
            <FormControl fullWidth margin="none">
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    className={`${submitBtnClassName} ${loading ? loadingClassName : 'text-black-c0'}`}
                    startIcon={loading &&
                        <CircularProgress className={loadingClassName ? loadingClassName : 'text-black-c0'} size={24}/>}
                >
                    {loading ? 'Loading...' : submitBtnText}
                </Button>
                {Object.values(errors).some(e => e) && (
                    <Alert className={'bg-danger bg-opacity-10 mt-3'} severity="error">
                        {Object.values(errors).join(', ')}
                    </Alert>
                )}
            </FormControl>
        </form>
    );
};

export default DynamicForm;
