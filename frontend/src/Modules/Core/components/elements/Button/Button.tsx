// Core/components/elements/Button/Button.tsx
import React from 'react';
import {Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress} from '@mui/material';
import {useTheme} from "Theme/ThemeContext";

type ColorVariant = 'primary' | 'secondary' | 'error' | 'success' | 'warning';
type ExtendedColorVariant = ColorVariant | string;

interface ButtonOwnProps {
    classNameOverride?: string;
    loading?: boolean;
    style?: React.CSSProperties;
    className?: string;
    color?: ExtendedColorVariant;
}

type ButtonProps<C extends React.ElementType> = ButtonOwnProps &
    Omit<MuiButtonProps<C>, 'color'> & {
    component?: C;
} & Omit<React.ComponentPropsWithRef<C>, keyof ButtonOwnProps | keyof MuiButtonProps>;

const Button = React.forwardRef(
    <C extends React.ElementType = 'button'>(
        props: ButtonProps<C>,
        ref: React.Ref<any>
    ) => {
        const {
            classNameOverride,
            style,
            className,
            loading = false,
            disabled = false,
            color,
            component,
            ...restProps
        } = props;

        const {theme} = useTheme();

        // List of predefined colors for checking
        const predefinedColors: ColorVariant[] = ['primary', 'secondary', 'error', 'success', 'warning'];

        // Function to get the background color based on the variant
        const getBackgroundColor = (): string | undefined => {
            if (!color) return theme.palette.text.primary90;
            if (disabled) return theme.palette.bg.contrast10;

            if (predefinedColors.includes(color as ColorVariant)) {
                switch (color) {
                    case 'primary':
                    case 'secondary':
                        return theme.colors[color].main;
                    case 'error':
                        return theme.colors.error.main;
                    case 'success':
                        return theme.colors.success.main;
                    case 'warning':
                        return theme.colors.warning.main;
                    default:
                        return theme.palette.text.primary;
                }
            }

            // If color is not a predefined variant, use it as a color string
            return color;
        };

        return (
            <MuiButton
                ref={ref}
                component={component}
                startIcon={loading && (
                    <CircularProgress
                        style={{color: theme.palette.text.contrast70}}
                        size={24}
                    />
                )}
                style={{
                    backgroundColor: getBackgroundColor(),
                    ...style,
                    color: disabled ? theme.palette.text.contrast40 : props?.sx?.color ? props.sx.color : style?.color ? style.color : theme.palette.bg.primary70,
                }}
                disabled={disabled}
                className={
                    classNameOverride
                        ? classNameOverride
                        : `
                            transition-all transition-d-300 transition-tf-eio 
                            ${className ? className : ''} 
                            ${loading ? 'opacity-75' : ''} backdrop-blur-10
                        `
                }
                {...restProps} // Spread the rest of the props, including 'to'
            />
        );
    }
) as <C extends React.ElementType = 'button'>(
    props: ButtonProps<C> & { ref?: React.Ref<any> }
) => JSX.Element;

export default Button;
