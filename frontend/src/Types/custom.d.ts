// Types/custom.d.ts

// SVG как React-компоненты
declare module '*.svg' {
    import React from 'react';
    export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
    const src: string;
    export default src;
}

// Изображения
declare module '*.png' {
    const value: string;
    export default value;
}

declare module '*.jpg' {
    const value: string;
    export default value;
}

declare module '*.jpeg' {
    const value: string;
    export default value;
}

declare module '*.gif' {
    const value: string;
    export default value;
}

declare module '*.bmp' {
    const value: string;
    export default value;
}

declare module '*.tiff' {
    const value: string;
    export default value;
}

declare module '*.webp' {
    const value: string;
    export default value;
}

// Стили (CSS Modules)
declare module '*.css' {
    const content: { [className: string]: string };
    export default content;
}

declare module '*.scss' {
    const content: { [className: string]: string };
    export default content;
}

declare module '*.sass' {
    const content: { [className: string]: string };
    export default content;
}

declare module '*.less' {
    const content: { [className: string]: string };
    export default content;
}

// JSON файлы
declare module '*.json' {
    const value: any;
    export default value;
}

// Шрифты
declare module '*.woff' {
    const value: string;
    export default value;
}

declare module '*.woff2' {
    const value: string;
    export default value;
}

declare module '*.eot' {
    const value: string;
    export default value;
}

declare module '*.ttf' {
    const value: string;
    export default value;
}

declare module '*.otf' {
    const value: string;
    export default value;
}

// Видео файлы
declare module '*.mp4' {
    const value: string;
    export default value;
}

declare module '*.webm' {
    const value: string;
    export default value;
}

// Аудио файлы
declare module '*.mp3' {
    const value: string;
    export default value;
}

declare module '*.wav' {
    const value: string;
    export default value;
}
