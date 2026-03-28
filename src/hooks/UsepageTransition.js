// usePageTransition.js
// Drop this file in your src/hooks/ folder (create the folder if it doesn't exist)
// Usage: replace navigate('/admin') with navigateWithFlip('/admin')

import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';

export const usePageTransition = () => {
  const navigate = useNavigate();

  const navigateWithFlip = (path) => {
    // Create frosted glass overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 99999;
      background: rgba(255, 255, 255, 0.4);
      backdrop-filter: blur(30px);
      -webkit-backdrop-filter: blur(30px);
      opacity: 0; pointer-events: none;
      display: flex; align-items: center; justify-content: center;
    `;
    const spinner = document.createElement('div');
    spinner.style.cssText = `
      width: 36px; height: 36px; border-radius: 50%;
      border: 3px solid rgba(15, 23, 42, 0.08); border-top-color: #0f172a;
      animation: hp-spin 0.8s linear infinite;
    `;
    // Add keyframes if not exists
    if (!document.getElementById('hp-spin-keyframe')) {
      const style = document.createElement('style');
      style.id = 'hp-spin-keyframe';
      style.textContent = `@keyframes hp-spin { to { transform: rotate(360deg); } }`;
      document.head.appendChild(style);
    }
    
    overlay.appendChild(spinner);
    document.body.appendChild(overlay);

    // Fast frosted fade out of current page
    gsap.to(overlay, {
      opacity: 1, duration: 0.35, ease: 'power2.inOut',
      onComplete: () => {
        navigate(path);
        // After DOM updates, fade the overlay out
        setTimeout(() => {
          gsap.to(overlay, {
            opacity: 0, duration: 0.4, ease: 'power2.inOut',
            onComplete: () => overlay.remove(),
          });
        }, 150);
      }
    });

    // Subtly scale the body back
    gsap.fromTo(document.body, 
      { scale: 1 },
      { scale: 0.98, duration: 0.35, ease: 'power2.inOut', 
        onComplete: () => gsap.set(document.body, { scale: 1 }) 
      }
    );
  };

  return { navigateWithFlip };
};