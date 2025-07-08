import React from 'react';
import {Container, FRCC} from 'wide-containers';
import {useTheme} from 'Theme/ThemeContext';

export interface PaymentTypeButtonProps extends React.ComponentProps<typeof Container> {
    selected?: boolean;
}

const PaymentTypeButton: React.FC<PaymentTypeButtonProps> = (
    {
        selected = false,
        cls = 'ftrans-300-eio',
        bg,
        boxShadow,
        rounded = 3,
        g = '.4rem',
        ...rest
    }) => {
    const {plt, theme} = useTheme();

    const resolvedBg = bg ?? `${plt.text.primary}07`;
    const resolvedBoxShadow =
        boxShadow ?? (selected ? `0 0 3px 1px${theme.colors.secondary.main}` : '');

    return (
        <FRCC
            cls={cls}
            bg={resolvedBg}
            boxShadow={resolvedBoxShadow}
            rounded={rounded}
            g={g}
            h={'100%'}
            {...rest}
        />
    );
};

export default PaymentTypeButton;
