'use client';

import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface MouseTiltCardProps {
    children: React.ReactNode;
    className?: string;
    tiltIntensity?: number;
    perspective?: number;
    glareEffect?: boolean;
    glareIntensity?: number;
    scale?: number;
    transition?: string;
}

const MouseTiltCard: React.FC<MouseTiltCardProps> = ({
    children,
    className = '',
    tiltIntensity = 15,
    perspective = 1000,
    glareEffect = true,
    glareIntensity = 0.3,
    scale = 1.05,
    transition = 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [transform, setTransform] = useState('');
    const [glareStyle, setGlareStyle] = useState({});

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        const rotateX = (mouseY / (rect.height / 2)) * -tiltIntensity;
        const rotateY = (mouseX / (rect.width / 2)) * tiltIntensity;

        const transformStyle = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
        setTransform(transformStyle);

        // Glare effect
        if (glareEffect) {
            const glareX = (mouseX / rect.width + 0.5) * 100;
            const glareY = (mouseY / rect.height + 0.5) * 100;

            setGlareStyle({
                background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,${glareIntensity}) 0%, transparent 50%)`,
                opacity: 1,
            });
        }
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setTransform('');
        setGlareStyle({});
    };

    return (
        <div
            ref={cardRef}
            className={cn(
                "inline-block cursor-pointer relative",
                className
            )}
            style={{
                transform: transform,
                transition: isHovered ? 'none' : transition,
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}

            {/* Glare Effect */}
            {glareEffect && (
                <div
                    className="absolute inset-0 pointer-events-none rounded-inherit"
                    style={{
                        ...glareStyle,
                        transition: isHovered ? 'none' : 'opacity 0.3s ease',
                        opacity: isHovered ? (glareStyle as any).opacity : 0,
                        zIndex: 99,
                        borderRadius: 'inherit'
                    }}
                />
            )}
        </div>
    );
};

export default MouseTiltCard;
