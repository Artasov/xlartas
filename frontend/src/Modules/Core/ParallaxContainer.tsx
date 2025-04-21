// Modules/Core/ParallaxContainer.tsx
import React, {useEffect, useRef} from 'react';
import {FC as FCLayout, FCCC} from 'WideLayout/Layouts';

type Rotation = { rx: number; ry: number };

interface ParallaxContainerProps {
    parallaxRef: React.RefObject<HTMLElement>;
    factor?: number;
    autoMove?: boolean;
    autoMoveAmplitude?: number;
    children: React.ReactNode;
}

const ParallaxContainer: React.FC<ParallaxContainerProps> = ({
                                                                 parallaxRef,
                                                                 factor = 0.1,
                                                                 autoMove = true,
                                                                 autoMoveAmplitude = 20,
                                                                 children,
                                                             }) => {
    // Refs для хранения текущих значений без перерисовок
    const containerRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const autoRotation = useRef<Rotation>({rx: 0, ry: 0});
    const userRotation = useRef<Rotation>({rx: 0, ry: 0});
    const targetRotation = useRef<Rotation>({rx: 0, ry: 0});
    const currentRotation = useRef<Rotation>({rx: 0, ry: 0});

    // Обработчик движения мыши
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const el = parallaxRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            userRotation.current = {
                rx: parseFloat((-y * factor).toFixed(2)),
                ry: parseFloat((x * factor).toFixed(2)),
            };
            targetRotation.current = {
                rx: autoRotation.current.rx + userRotation.current.rx,
                ry: autoRotation.current.ry + userRotation.current.ry,
            };
        };

        const el = parallaxRef.current;
        if (el) el.addEventListener('mousemove', handleMouseMove);
        return () => {
            if (el) el.removeEventListener('mousemove', handleMouseMove);
        };
    }, [parallaxRef, factor]);

    // Авто-движение
    useEffect(() => {
        if (!autoMove) {
            autoRotation.current = {rx: 0, ry: 0};
            return;
        }
        let rafId: number;
        const updateAuto = () => {
            const time = Date.now();
            const period = 10000;
            const angle = ((time % period) / period) * 2 * Math.PI;
            autoRotation.current = {
                rx: autoMoveAmplitude * Math.sin(angle),
                ry: autoMoveAmplitude * Math.cos(angle),
            };
            targetRotation.current = {
                rx: autoRotation.current.rx + userRotation.current.rx,
                ry: autoRotation.current.ry + userRotation.current.ry,
            };
            rafId = requestAnimationFrame(updateAuto);
        };
        rafId = requestAnimationFrame(updateAuto);
        return () => cancelAnimationFrame(rafId);
    }, [autoMove, autoMoveAmplitude]);

    // Основной цикл анимации
    useEffect(() => {
        let rafId: number;
        const animate = () => {
            const speed = 0.5;
            const dx = targetRotation.current.rx - currentRotation.current.rx;
            const dy = targetRotation.current.ry - currentRotation.current.ry;
            currentRotation.current = {
                rx: currentRotation.current.rx + dx * speed,
                ry: currentRotation.current.ry + dy * speed,
            };
            const transform = `rotateX(${currentRotation.current.rx}deg) rotateY(${currentRotation.current.ry}deg)`;
            if (innerRef.current) {
                innerRef.current.style.transform = transform;
            }
            rafId = requestAnimationFrame(animate);
        };
        rafId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafId);
    }, []);

    return (
        <FCCC
            ref={containerRef}
            h="100%" w="100%"
            cls="parallax-container"
            scroll="hidden"
            sx={{perspective: '1000px', willChange: 'transform'}}
        >
            <FCLayout
                ref={innerRef}
                sx={{transition: 'transform 0.1s ease-out'}}
            >
                {children}
            </FCLayout>
        </FCCC>
    );
};

export default ParallaxContainer;
