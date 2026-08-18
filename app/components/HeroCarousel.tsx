'use client';
import { useState, useEffect } from 'react';

const images = [
  '/hero-images/hero1.jpg',
  '/hero-images/hero2.jpg',
  '/hero-images/hero3.jpg'
];

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000); // Change image every 4 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hero-image-window" style={{ position: 'relative', overflow: 'hidden' }}>
      {images.map((src, index) => (
        <img
          key={src}
          src={src}
          width="1600"
          height="840"
          alt="퇴직 후 경험을 새로운 수입으로 연결하는 중년의 작업 장면"
          fetchPriority={index === 0 ? "high" : "auto"}
          style={{
            position: index === 0 ? 'relative' : 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: index === currentIndex ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
            zIndex: index === currentIndex ? 1 : 0
          }}
        />
      ))}
    </div>
  );
}
