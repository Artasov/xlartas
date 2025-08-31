// Modules/Core/BackgroundFlicker.tsx
import React from 'react';
import Particles from 'UI/Particles/Particles';

interface BackgroundFlickerProps {
    // kept for compatibility with existing usage
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

const BackgroundFlicker: React.FC<BackgroundFlickerProps> = () => {
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
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <Particles
                    particleColors={['#ffffff', '#ffffff']}
                    particleCount={200}
                    particleSpread={10}
                    speed={0.1}
                    particleBaseSize={100}
                    moveParticlesOnHover={false}
                    alphaParticles={false}
                    disableRotation={false}

                />
            </div>
        </div>
    );
};

export default React.memo(BackgroundFlicker);

