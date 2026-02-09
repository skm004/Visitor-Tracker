import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
  const navigate = useNavigate();
  
  // Refs for animation targets
  const navRef = useRef(null);
  const heroTitleRef = useRef(null);
  const gradientTextRef = useRef(null);
  const heroSubtitleRef = useRef(null);
  const heroButtonsRef = useRef(null);
  const shape1Ref = useRef(null);
  const shape2Ref = useRef(null);
  const shape3Ref = useRef(null);
  const featureCardsRef = useRef([]);
  const statItemsRef = useRef([]);
  const sectionTitlesRef = useRef([]);
  const ctaSectionRef = useRef(null);
  const heroContentRef = useRef(null);

  useLayoutEffect(() => {
  const ctx = gsap.context(() => {

    // Navbar animation
    if (navRef.current) {
      gsap.from(navRef.current, {
        y: -100,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      });
    }

    // Hero animations
    if (heroTitleRef.current) {
      gsap.from(heroTitleRef.current, {
        opacity: 0,
        y: 50,
        duration: 1,
        delay: 0.3,
        ease: 'power3.out'
      });
    }

    if (gradientTextRef.current) {
      gsap.from(gradientTextRef.current, {
        opacity: 0,
        scale: 0.8,
        duration: 1,
        delay: 0.6,
        ease: 'back.out(1.7)'
      });
    }

    if (heroSubtitleRef.current) {
      gsap.from(heroSubtitleRef.current, {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 0.9,
        ease: 'power3.out'
      });
    }

    if (heroButtonsRef.current) {
      gsap.from(heroButtonsRef.current, {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 1.2,
        ease: 'power3.out'
      });
    }

    // Floating shapes
    gsap.to(shape1Ref.current, {
      y: -30,
      x: 20,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    gsap.to(shape2Ref.current, {
      y: 30,
      x: -20,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    gsap.to(shape3Ref.current, {
      y: -20,
      x: 30,
      duration: 3.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    // Feature cards
    featureCardsRef.current.forEach((card, i) => {
      if (!card) return;
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 80%'
        },
        opacity: 0,
        y: 50,
        duration: 0.8,
        delay: i * 0.1,
        ease: 'power3.out'
      });
    });

    // Stats
    statItemsRef.current.forEach((stat, i) => {
      if (!stat) return;
      const numberElement = stat.querySelector('.stat-number');
      const target = parseInt(numberElement.dataset.target, 10);

      gsap.to(stat, {
        scrollTrigger: {
          trigger: stat,
          start: 'top 80%'
        },
        opacity: 1,
        scale: 1,
        duration: 0.6,
        delay: i * 0.1,
        ease: 'back.out(1.7)',
        onStart: () => {
          let count = 0;
          const inc = target / 50;
          const timer = setInterval(() => {
            count += inc;
            if (count >= target) {
              numberElement.textContent = target;
              clearInterval(timer);
            } else {
              numberElement.textContent = Math.floor(count);
            }
          }, 30);
        }
      });
    });

  });

  return () => ctx.revert();
}, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const features = [
    {
      icon: '📍',
      title: 'Real-Time Tracking',
      description: 'Track visitor locations in real-time using advanced Wi-Fi RSSI triangulation technology for precise positioning.'
    },
    {
      icon: '✅',
      title: 'Approval System',
      description: 'Streamlined visitor approval workflow allowing administrators to quickly approve or reject entry requests.'
    },
    {
      icon: '📊',
      title: 'Analytics Dashboard',
      description: 'Comprehensive dashboard with insights into visitor patterns, peak times, and facility utilization metrics.'
    },
    {
      icon: '📱',
      title: 'Mobile Ready',
      description: 'Fully responsive design works seamlessly across all devices - desktop, tablet, and mobile.'
    },
    {
      icon: '🔒',
      title: 'Secure Access',
      description: 'Enterprise-grade security with role-based access control and encrypted data transmission.'
    },
    {
      icon: '📝',
      title: 'Visitor Records',
      description: 'Complete history of all visitor entries with searchable records and detailed visit information.'
    }
  ];

  const stats = [
    { number: 28, label: "Today's Visitors" },
    { number: 12, label: 'Currently Inside' },
    { number: 5, label: 'Pending Approvals' },
    { number: 4, label: 'Active Wi-Fi Nodes' }
  ];

  return (
    <div className="homepage">
      {/* Navigation */}
      <nav ref={navRef}>
        <div className="logo">VisitorTrack</div>
        <ul className="nav-links">
          <li><a onClick={() => scrollToSection('home')}>Home</a></li>
          <li><a onClick={() => scrollToSection('features')}>Features</a></li>
          <li><a onClick={() => scrollToSection('about')}>About</a></li>
          <li><a onClick={() => scrollToSection('contact')}>Contact</a></li>
        </ul>
        <button className="cta-btn" onClick={() => navigate('/admin')}>
          Admin Login
        </button>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="bg-animation">
          <div ref={shape1Ref} className="floating-shape shape1"></div>
          <div ref={shape2Ref} className="floating-shape shape2"></div>
          <div ref={shape3Ref} className="floating-shape shape3"></div>
        </div>
        
        <div ref={heroContentRef} className="hero-content">
          <h1>
            <span ref={heroTitleRef} className="hero-title">Welcome to</span><br />
            <span ref={gradientTextRef} className="gradient-text">VisitorTrack</span>
          </h1>
          <p ref={heroSubtitleRef} className="hero-subtitle">
            Smart visitor management powered by Wi-Fi RSSI triangulation. 
            Track, manage, and secure your facility with cutting-edge technology.
          </p>
          <div ref={heroButtonsRef} className="hero-buttons">
            <button className="primary-btn" onClick={() => navigate('/admin')}>
              Get Started
            </button>
            <button className="secondary-btn" onClick={() => scrollToSection('features')}>
              Learn More
            </button>
          </div>
        </div>

        <div className="scroll-indicator">
          <div className="mouse"></div>
          <span>Scroll</span>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <h2 
          ref={el => sectionTitlesRef.current[0] = el} 
          className="section-title"
        >
          Powerful <span className="gradient-text">Features</span>
        </h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index}
              ref={el => featureCardsRef.current[index] = el}
              className="feature-card"
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <h2 
          ref={el => sectionTitlesRef.current[1] = el} 
          className="section-title"
        >
          Track Your <span className="gradient-text">Impact</span>
        </h2>
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div 
              key={index}
              ref={el => statItemsRef.current[index] = el}
              className="stat-item"
            >
              <div className="stat-number" data-target={stat.number}>0</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaSectionRef} className="cta-section">
        <h2>Ready to Transform Your Visitor Management?</h2>
        <p>Join modern facilities using VisitorTrack for smarter, safer visitor experiences.</p>
        <button className="primary-btn" onClick={() => navigate('/admin')}>
          Start Managing Visitors
        </button>
      </section>

      {/* Footer */}
      <footer>
        <p>&copy; 2026 VisitorTrack. Final Year Project - Smart Visitor Management System</p>
      </footer>
    </div>
  );
};

export default HomePage;






// import React from 'react';

// const HomePage = () => {
//   return (
//     <div style={{ 
//       padding: '100px', 
//       fontSize: '40px', 
//       color: 'red', 
//       backgroundColor: 'yellow',
//       textAlign: 'center'
//     }}>
//       <h1>🏠 THIS IS THE HOMEPAGE! 🏠</h1>
//       <p>If you see this bright yellow page, HomePage is loading!</p>
//       <a href="/admin" style={{ color: 'blue', fontSize: '30px' }}>
//         Go to Admin Dashboard
//       </a>
//     </div>
//   );
// };

// export default HomePage;