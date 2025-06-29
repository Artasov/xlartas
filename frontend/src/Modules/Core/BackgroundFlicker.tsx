import React, {CSSProperties, useEffect, useMemo} from 'react';
import {useTheme} from 'Theme/ThemeContext';

/* ---------- API -------------------------------------------------------- */

interface BackgroundFlickerProps {
    count?: number;
    stickThickness?: number;
    stickLength?: number;
    stickLengthJitter?: number;
    baseSize?: number;
    sizeJitter?: number;
    glowSize?: number;
    glowSizeJitter?: number;
    glowFraction?: number;
}

/* ---------- ОДНА ЗВЁЗДА ------------------------------------------------ */

interface StarProps {
    x: number;
    y: number;
    size: number;
    delay: number;
    duration: number;
    rotate: number;
    glowColor?: string;
    stickThickness: number;
    stickLengthFactor: number;
    glowFactor: number;
}

const StarLight: React.FC<StarProps> = ({
                                            x,
                                            y,
                                            size,
                                            delay,
                                            duration,
                                            rotate,
                                            glowColor,
                                            stickThickness,
                                            stickLengthFactor,
                                            glowFactor,
                                        }) => {
    /* Обёртка: позиция + фиксированный поворот */
    const wrapper: CSSProperties = {
        position: 'absolute',
        top: `${y}%`,
        left: `${x}%`,
        width: size,
        height: size,
        pointerEvents: 'none',
        transform: `rotate(${rotate}deg)`,
    };

    /* Аниматор: масштаб + прозрачность */
    const scaler: CSSProperties = {
        width: '100%',
        height: '100%',
        animation: `xflickerScale ${duration}ms ease-in-out ${delay}ms infinite`,
        willChange: 'opacity,transform',
    };

    const baseRay: CSSProperties = {
        position: 'absolute',
        background: 'rgba(255,255,255,0.9)',
        borderRadius: '50%',
        filter: 'blur(.8px)',
    };

    const horiz: CSSProperties = {
        ...baseRay,
        top: '50%',
        left: 0,
        width: '100%',
        height: `${(stickThickness * 100).toFixed(1)}%`,
        marginTop: `-${(stickThickness * 50).toFixed(1)}%`,
        transform: `scaleX(${stickLengthFactor})`,
    };

    const vert: CSSProperties = {
        ...baseRay,
        left: '50%',
        top: 0,
        width: `${(stickThickness * 100).toFixed(1)}%`,
        height: '100%',
        marginLeft: `-${(stickThickness * 50).toFixed(1)}%`,
        transform: `scaleY(${stickLengthFactor})`,
    };

    /* glow рендерится ВНУТРИ scaler → исчезает синхронно */
    const glow: CSSProperties | undefined = glowColor
        ? {
            position: 'absolute',
            left: `calc(50% - ${0.5 * glowFactor * size}px)`,
            top: `calc(50% - ${0.5 * glowFactor * size}px)`,
            width: glowFactor * size,
            height: glowFactor * size,
            borderRadius: '50%',
            background: glowColor,
            opacity: 0.35,
            filter: 'blur(9px)',
            pointerEvents: 'none',
        }
        : undefined;

    return (
        <span style={wrapper}>
            <span style={scaler}>
                {glow && <span style={glow}/>}
                <span style={horiz}/>
                <span style={vert}/>
            </span>
        </span>
    );
};

/* ---------- КОЛЛЕКЦИЯ ЗВЁЗД ------------------------------------------- */

const BackgroundFlicker: React.FC<BackgroundFlickerProps> = ({
                                                                 count = 120,
                                                                 stickThickness = 0.22,
                                                                 stickLength = 1.8,
                                                                 stickLengthJitter = 0.4,
                                                                 baseSize = 3,
                                                                 sizeJitter = 0.5,
                                                                 glowSize = 4,
                                                                 glowSizeJitter = 0.5,
                                                                 glowFraction = 0.3,
                                                             }) => {
    const {plt} = useTheme();

    const primaryMain =
        (plt as any)?.colors?.primary?.main ?? '#fe586b';
    const secondaryMain =
        (plt as any)?.colors?.secondary?.main ?? '#4f50ab';

    const stars = useMemo(() => {
        const rand = (min = 0, max = 1) => Math.random() * (max - min) + min;
        const sign = () => (Math.random() < 0.5 ? -1 : 1);

        const list: StarProps[] = [];
        for (let i = 0; i < count; i++) {
            const size = baseSize * (1 + sign() * rand(0, sizeJitter));
            const stickLengthFactor =
                stickLength * (1 + sign() * rand(0, stickLengthJitter));
            const hasGlow = Math.random() < glowFraction;
            const glowFactor =
                glowSize * (1 + sign() * rand(0, glowSizeJitter));

            list.push({
                x: rand(0, 100),
                y: rand(0, 100),
                size,
                delay: rand(0, 5000),
                duration: 1500 + rand(0, 2500),
                rotate: rand(0, 360),
                glowColor: hasGlow
                    ? Math.random() < 0.5
                        ? primaryMain
                        : secondaryMain
                    : undefined,
                stickThickness,
                stickLengthFactor,
                glowFactor,
            });
        }
        return list;
    }, [
        count,
        baseSize,
        sizeJitter,
        stickThickness,
        stickLength,
        stickLengthJitter,
        glowSize,
        glowSizeJitter,
        glowFraction,
        primaryMain,
        secondaryMain,
    ]);

    /* keyframes — один раз */
    useEffect(() => {
        if (document.getElementById('xflicker-scale')) return;
        const style = document.createElement('style');
        style.id = 'xflicker-scale';
        style.textContent = `
            @keyframes xflickerScale {
                0%,100% { opacity: 0; transform: scale(0.7); }
                50%     { opacity: 1; transform: scale(1);   }
            }
        `;
        document.head.appendChild(style);
    }, []);

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                overflow: 'hidden',
                pointerEvents: 'none',
                zIndex: 2,
            }}
        >
            {stars.map((s, i) => (
                <StarLight key={i} {...s} />
            ))}
        </div>
    );
};

export default React.memo(BackgroundFlicker);
