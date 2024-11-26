import React, { useState, useEffect } from 'react';
import './styles.css';

const TextLooper = ({ texts, interval = 2000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeClass, setFadeClass] = useState('fade-in');

  useEffect(() => {
    const updateText = () => {
      setFadeClass('fade-out');
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length);
        setFadeClass('fade-in');
      }, 1000); // Duration matches CSS animation
    };

    const intervalId = setInterval(() => {
      updateText();
    }, interval);

    updateText(); // Initialize immediately

    return () => {
      clearInterval(intervalId);
    };
  }, [texts.length, interval]);

  return (
    <span className={`text-looper ${fadeClass}`}>
      {texts[currentIndex]}
    </span>
  );
};

export default TextLooper;