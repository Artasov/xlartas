// Modules/Core/components/StarRating.tsx

import React from 'react';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import {useTheme} from "Theme/ThemeContext";

interface StarRatingProps {
    rating: number | null | undefined;
    starClassName?: string;
    ratingWrapperClassName?: string;
    ratingContentClassName?: string;
    ratingValueClassName?: string;
    ratingValueStyle?: React.CSSProperties;
}

const StarRating: React.FC<StarRatingProps> = (
    {
        rating,
        starClassName,
        ratingWrapperClassName = '',
        ratingContentClassName = '',
        ratingValueClassName = '',
        ratingValueStyle,
    }) => {
    const {theme} = useTheme();
    const getStarFillPercentage = (index: number, rating: number) => {
        const fullStars = Math.floor(rating);
        if (index < fullStars) return 100;
        else if (index === fullStars) return (rating - fullStars) * 100;
        else return 0;
    };

    return (
        <div className={`frc ${ratingWrapperClassName}`}>
            <div className={`frcc ${ratingContentClassName}`} style={{
                backgroundColor: theme.palette.bg.contrast20,
            }}>
                <span className={`${ratingValueClassName}`} style={{
                    color: theme.palette.text.contrast, ...ratingValueStyle
                }}>
                    {rating?.toFixed(1) || 0}
                </span>
                {[...Array(5)].map((_, index) => {
                    const fillPercentage = getStarFillPercentage(index, rating || 0);
                    return (
                        <div key={index} style={{position: 'relative', display: 'inline-block'}}>
                            <StarRoundedIcon className={starClassName} sx={{
                                color: theme.palette.text.contrast70,
                                filter: `drop-shadow(0 0 2px ${theme.palette.text.contrast70.replace(' !important', '')});`
                            }}/>
                            {fillPercentage > 0 && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: `${fillPercentage}%`,
                                        height: '100%',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <StarRoundedIcon className={starClassName} sx={{
                                        color: '#ffb72f'
                                    }}/>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StarRating;
