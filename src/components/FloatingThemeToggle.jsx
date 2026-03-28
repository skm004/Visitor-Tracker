import React, { useEffect, useState } from 'react';

export default function FloatingThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check localStorage or system preference
    const savedTheme = localStorage.getItem('vt-theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.body.classList.add('obsidian-mode');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.body.classList.remove('obsidian-mode');
      localStorage.setItem('vt-theme', 'light');
      setIsDark(false);
    } else {
      document.body.classList.add('obsidian-mode');
      localStorage.setItem('vt-theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? "Switch to Silver Light Mode" : "Switch to Obsidian Dark Mode"}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.05)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(15, 23, 42, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        fontSize: '22px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(15, 23, 42, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.05)';
      }}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
