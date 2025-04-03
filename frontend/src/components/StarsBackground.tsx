"use client";

import { useEffect, useState } from 'react';

interface Star {
  size: 'small' | 'medium' | 'large';
  left: string;
  top: string;
  delay: string;
}

export default function StarsBackground() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const starCount = 100;
    const generatedStars: Star[] = [];
    
    for (let i = 0; i < starCount; i++) {
      const size = Math.random();
      let starSize: 'small' | 'medium' | 'large';
      
      if (size < 0.6) {
        starSize = 'small';
      } else if (size < 0.9) {
        starSize = 'medium';
      } else {
        starSize = 'large';
      }
      
      generatedStars.push({
        size: starSize,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 10}s`
      });
    }
    
    setStars(generatedStars);
  }, []);

  return (
    <div className="stars">
      {stars.map((star, index) => (
        <div
          key={index}
          className={`star ${star.size}`}
          style={{
            left: star.left,
            top: star.top,
            animationDelay: star.delay
          }}
        ></div>
      ))}
    </div>
  );
}
