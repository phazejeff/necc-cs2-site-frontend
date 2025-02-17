// src/components/DarkModeToggle.tsx
"use client";

import React, { useEffect, useState } from 'react';
import * as Switch from '@radix-ui/react-switch';
import { Sun, Moon } from 'lucide-react';

const DarkModeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // On mount, check local storage and set initial mode
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Toggle dark mode and save preference
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newMode;
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <Sun className="w-5 h-5 text-yellow-500 dark:text-gray-400" />
      <Switch.Root
        checked={isDarkMode}
        onCheckedChange={toggleDarkMode}
        className="w-12 h-6 bg-gray-300 dark:bg-gray-700 rounded-full relative transition-colors duration-300"
      >
        <Switch.Thumb
          className={`block w-5 h-5 bg-white dark:bg-gray-400 rounded-full shadow transform transition-transform duration-300 ${
            isDarkMode ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </Switch.Root>
      <Moon className="w-5 h-5 text-gray-400 dark:text-yellow-500" />
    </div>
  );
};

export default DarkModeToggle;
