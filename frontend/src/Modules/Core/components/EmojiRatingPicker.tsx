// Modules/Core/components/EmojiRatingPicker.tsx
import React from 'react';
import e1 from '../../../Static/img/emoji/rating/1.png';
import e2 from '../../../Static/img/emoji/rating/2.png';
import e3 from '../../../Static/img/emoji/rating/3.png';
import e4 from '../../../Static/img/emoji/rating/4.png';
import e5 from '../../../Static/img/emoji/rating/5.png';
import {FC, FR} from "wide-containers";

interface EmojiRatingPickerProps {
    value: number | null;
    onChange: (value: number) => void;
}

// https://icons8.com/icon/set/emoji/3d-fluency
const EmojiRatingPicker: React.FC<EmojiRatingPickerProps> = ({value, onChange}) => {
    const emojis = [1, 2, 3, 4, 5];
    return (
        <FR g={1}>
            {emojis.map((num) => (
                <FC key={num} w={40} h={40} pos={'relative'}>
                    {/* Верхний слой изображения */}
                    <img
                        src={num === 1 ? e1 : num === 2 ? e2 : num === 3 ? e3 : num === 4 ? e4 : e5}
                        alt={`rating-${num}`}
                        style={{
                            width: '40px',
                            height: '40px',
                            zIndex: 5,
                            transform: value === num ? 'scale(1.4)' : 'scale(1)',
                            filter: value === num ? 'grayscale(0)' : 'grayscale(.5)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease-in-out',
                        }}
                        onClick={() => onChange(num)}
                    />
                    {/* Нижний слой изображения */}
                    <img
                        src={num === 1 ? e1 : num === 2 ? e2 : num === 3 ? e3 : num === 4 ? e4 : e5}
                        alt={`rating-${num}`}
                        style={{
                            position: 'absolute',
                            top: '0',
                            left: '0',
                            zIndex: 2,
                            opacity: value ? (value >= num ? '100%' : 0) : '50%',
                            transition: 'all 0.2s ease-in-out',
                            width: '40px',
                            height: '40px',
                            transform: value === num ? 'scale(1.5)' : 'scale(1)',
                            filter: value === num ? 'grayscale(0) blur(7px)' : 'grayscale(.5) blur(1px)',
                            cursor: 'pointer',
                        }}
                        onClick={() => onChange(num)}
                    />
                </FC>
            ))}
        </FR>
    );
};

export default EmojiRatingPicker;
