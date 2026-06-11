
"use client";

import React, { useRef, useEffect } from 'react';

const PortfolioButton = () => {
    const btnRef = useRef<HTMLButtonElement>(null);

    const createParticle = (x: number, y: number) => {
        const particle = document.createElement('div');
        particle.className = 'particle';
        document.body.appendChild(particle);

        const size = Math.random() * 10 + 5;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        const colors = ['#ff00cc', '#00ccff', '#ffcc00', '#00ff88', '#ffffff', '#ff6600'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];

        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;

        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * 140 + 60;

        particle.animate([
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
            { transform: `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance}px)) scale(0)`, opacity: 0 }
        ], {
            duration: 900 + Math.random() * 1000,
            easing: 'ease-out'
        }).onfinish = () => particle.remove();
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        for (let i = 0; i < 60; i++) {
            createParticle(x, y);
        }
        window.open('https://htghuzaifa.huzi.pk/', '_blank', 'noopener,noreferrer');
    };

    return (
        <button
            ref={btnRef}
            className="portfolio-btn"
            onClick={handleClick}
        >
            ✨ View Portfolio ✨
        </button>
    );
};

export default PortfolioButton;
