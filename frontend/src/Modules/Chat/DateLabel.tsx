// Modules/Chat/DateLabel.tsx

import React from 'react';
import {FC} from "wide-containers";
import {format, isThisYear, isToday, parseISO} from 'date-fns';
import {useTheme} from "Theme/ThemeContext";

interface DateLabelProps {
    date: string;
}

const DateLabel: React.FC<DateLabelProps> = ({date}) => {
    const {plt} = useTheme();
    const messageDate = parseISO(date);

    const formatDateLabel = () => {
        if (isToday(messageDate)) {
            return 'Сегодня';
        } else if (isThisYear(messageDate)) {
            return format(messageDate, 'd MMMM');
        } else {
            return format(messageDate, 'd MMMM yyyy');
        }
    };

    return (
        <FC py={4} mx={'auto'} w={'min-content'} key={`date-${date}`}>
            <FC
                rounded={5}
                px={1}
            >
                <FC cls={`date-label text-nowrap`} color={plt.text.primary}>
                    {formatDateLabel()}
                </FC>
            </FC>
        </FC>
    );
};

export default React.memo(DateLabel);
