// Modules/Core/ParallaxContainer.tsx
import React, { useEffect, useState } from 'react';
import { FC, FCCC, FC as FCLayout } from "WideLayout/Layouts";

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
    autoMoveAmplitude = 20, // Амплитуда в градусах
    children,
}) => {
    // Состояния для авто движения и движения мыши
    const [autoRotation, setAutoRotation] = useState<Rotation>({ rx: 0, ry: 0 });
    const [userRotation, setUserRotation] = useState<Rotation>({ rx: 0, ry: 0 });
    // Итоговая цель для анимации (сумма авто + пользовательских смещений)
    const [targetRotation, setTargetRotation] = useState<Rotation>({ rx: 0, ry: 0 });
    // Текущее состояние анимации (интерполируется к targetRotation)
    const [rotation, setRotation] = useState<Rotation>({ rx: 0, ry: 0 });

    // Эффект плавной анимации от rotation к targetRotation
    useEffect(() => {
        let rafId: number;
        const animate = () => {
            setRotation(prev => {
                const speed = 0.1; // чем меньше значение, тем плавнее
                const dx = targetRotation.rx - prev.rx;
                const dy = targetRotation.ry - prev.ry;
                return {
                    rx: prev.rx + dx * speed,
                    ry: prev.ry + dy * speed,
                };
            });
            rafId = requestAnimationFrame(animate);
        };
        rafId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafId);
    }, [targetRotation]);

    // Эффект отслеживания движения мыши для обновления userRotation
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (parallaxRef.current) {
                const rect = parallaxRef.current.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                setUserRotation({
                    rx: parseFloat((-y * factor).toFixed(2)),
                    ry: parseFloat((x * factor).toFixed(2)),
                });
            }
        };

        const element = parallaxRef.current;
        if (element) {
            element.addEventListener('mousemove', handleMouseMove);
        }
        return () => {
            if (element) {
                element.removeEventListener('mousemove', handleMouseMove);
            }
        };
    }, [parallaxRef, factor]);

    // Эффект авто движения (круговой ход) при включённом autoMove
    useEffect(() => {
        if (!autoMove) {
            setAutoRotation({ rx: 0, ry: 0 });
            return;
        }
        let rafId: number;
        const updateAuto = () => {
            const time = Date.now();
            const period = 10000; // полный оборот за 10 секунд
            const angle = ((time % period) / period) * 2 * Math.PI;
            setAutoRotation({
                rx: autoMoveAmplitude * Math.sin(angle),
                ry: autoMoveAmplitude * Math.cos(angle),
            });
            rafId = requestAnimationFrame(updateAuto);
        };
        rafId = requestAnimationFrame(updateAuto);
        return () => cancelAnimationFrame(rafId);
    }, [autoMove]);

    // Обновляем итоговую targetRotation как сумму авто и пользовательского эффектов
    useEffect(() => {
        setTargetRotation({
            rx: autoRotation.rx + userRotation.rx,
            ry: autoRotation.ry + userRotation.ry,
        });
    }, [autoRotation, userRotation]);

    const transform = `rotateX(${rotation.rx}deg) rotateY(${rotation.ry}deg)`;

    return (
        <FCCC
            h={'100%'}
            w={'100%'}
            cls={'parallax-container'}
            scroll={'hidden'}
            sx={{ perspective: '1000px' }}
        >
            <FCLayout sx={{ transform, transition: 'transform 0.1s ease-out' }}>
                {children}
            </FCLayout>
        </FCCC>
    );
};

export default ParallaxContainer;
