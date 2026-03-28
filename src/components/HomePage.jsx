import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';
import { usePageTransition } from '../hooks/UsepageTransition';

gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
  const navigate = useNavigate();
  const { navigateWithFlip } = usePageTransition();
  
  const navRef = useRef(null);
  const heroTitleRef = useRef(null);
  const heroSubtitleRef = useRef(null);
  const heroButtonsRef = useRef(null);
  const shape1Ref = useRef(null);
  const shape2Ref = useRef(null);
  const featureCardsRef = useRef([]);
  const statItemsRef = useRef([]);
  const ecosystemCardsRef = useRef([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {

      // Navbar floating in
      if (navRef.current) {
        gsap.from(navRef.current, {
          y: -80, opacity: 0, duration: 1.2, ease: 'power4.out', delay: 0.1
        });
      }

      // Hero content
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      
      tl.from(heroTitleRef.current, { y: 40, opacity: 0, duration: 1, delay: 0.3 })
        .from(heroSubtitleRef.current, { y: 30, opacity: 0, duration: 0.8 }, "-=0.6")
        .from(heroButtonsRef.current, { y: 20, opacity: 0, duration: 0.8 }, "-=0.5");

      // Ambient background shapes
      gsap.to(shape1Ref.current, {
        y: -40, x: 30, rotation: 5, duration: 6, repeat: -1, yoyo: true, ease: 'sine.inOut'
      });
      gsap.to(shape2Ref.current, {
        y: 40, x: -30, rotation: -5, duration: 7, repeat: -1, yoyo: true, ease: 'sine.inOut'
      });

      // Feature cards stagger
      featureCardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.from(card, {
          scrollTrigger: { trigger: card, start: 'top 85%' },
          opacity: 0, y: 40, duration: 0.8, delay: i * 0.1, ease: 'power3.out'
        });
      });

      // Ecosystem cards
      ecosystemCardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.from(card, {
          scrollTrigger: { trigger: card, start: 'top 85%' },
          opacity: 0, x: i % 2 === 0 ? -40 : 40, duration: 0.8, ease: 'power3.out'
        });
      });

      // Stats counters
      statItemsRef.current.forEach((stat, i) => {
        if (!stat) return;
        const numberElement = stat.querySelector('.stat-number');
        if (!numberElement) return;
        const target = parseInt(numberElement.dataset.target, 10);

        gsap.to(stat, {
          scrollTrigger: { trigger: stat, start: 'top 85%' },
          opacity: 1, scale: 1, duration: 0.6, delay: i * 0.1, ease: 'back.out(1.5)',
          onStart: () => {
            let count = 0;
            const inc = Math.max(1, target / 40);
            const timer = setInterval(() => {
              count += inc;
              if (count >= target) {
                numberElement.textContent = target + (target > 20 ? '+' : '');
                clearInterval(timer);
              } else {
                numberElement.textContent = Math.floor(count);
              }
            }, 40);
          }
        });
      });

    });
    return () => ctx.revert();
  }, []);

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const features = [
    {
      icon: <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />,
      title: 'Real-Time Tracking',
      desc: 'Pinpoint visitor locations instantly using advanced Wi-Fi RSSI triangulation.'
    },
    {
      icon: <g><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round"/><polyline points="22 4 12 14.01 9 11.01" /></g>,
      title: 'Instant Approvals',
      desc: 'Streamlined workflow allowing administrators to approve entry requests securely.'
    },
    {
      icon: <g><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></g>,
      title: 'Deep Analytics',
      desc: 'Comprehensive dashboard revealing visitor patterns and facility utilization.'
    },
    {
      icon: <g><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></g>,
      title: 'Mobile Optimized',
      desc: 'Flawless responsive design accessible from desktop to mobile.'
    },
    {
      icon: <g><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></g>,
      title: 'Enterprise Security',
      desc: 'Role-based access control with top-tier encrypted data transmission.'
    },
    {
      icon: <g><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></g>,
      title: 'Audit Records',
      desc: 'Complete history of all visitor entries perfectly maintained for compliance.'
    }
  ];

  return (
    <div className="hp-wrapper">
      
      {/* Background Ambience */}
      <div className="hp-bg-glass" />
      <div className="hp-waves-container">
        <svg className="hp-waves" viewBox="0 24 150 28" preserveAspectRatio="none">
          <defs>
            <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
          </defs>
          <g className="hp-wave-parallax">
            <use xlinkHref="#gentle-wave" x="48" y="0" />
            <use xlinkHref="#gentle-wave" x="48" y="3" />
            <use xlinkHref="#gentle-wave" x="48" y="5" />
            <use xlinkHref="#gentle-wave" x="48" y="7" />
          </g>
        </svg>
      </div>
      <div ref={shape1Ref} className="hp-blob hp-blob-1" />
      <div ref={shape2Ref} className="hp-blob hp-blob-2" />

      {/* Navigation */}
      <nav ref={navRef} className="hp-nav">
        <div className="hp-logo">
          <div className="hp-logo-icon">VT</div>
          <span className="hp-logo-text">VisitorTrack</span>
        </div>
        <ul className="hp-nav-links">
          <li><button onClick={() => scrollToSection('features')}>Features</button></li>
          <li><button onClick={() => scrollToSection('impact')}>Impact</button></li>
        </ul>
        <button className="hp-nav-cta" onClick={() => navigateWithFlip('/admin')}>
          Command Centre
        </button>
      </nav>

      {/* Hero Section */}
      <section className="hp-hero" id="home">
        <div className="hp-hero-content">
          <div ref={heroTitleRef}>
            <span className="hp-badge">Modern facility security</span>
            <h1 className="hp-title">
              Frictionless access.<br/>
              <span className="hp-title-accent">Flawless tracking.</span>
            </h1>
          </div>
          <p ref={heroSubtitleRef} className="hp-subtitle">
            VisitorTrack leverages advanced Wi-Fi triangulation to provide unprecedented 
            visibility into your facility. Elevate your security without slowing down your guests.
          </p>
          <div ref={heroButtonsRef} className="hp-buttons">
            <button className="hp-btn-primary" onClick={() => navigateWithFlip('/admin')}>
              Start Managing
            </button>
            <button className="hp-btn-secondary" onClick={() => scrollToSection('features')}>
              Explore Platform
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="hp-features" id="features">
        <div className="hp-section-header">
          <h2>Core <span className="hp-title-accent">Capabilities</span></h2>
          <p>Everything you need to secure your premises seamlessly.</p>
        </div>
        
        <div className="hp-features-grid">
          {features.map((feature, idx) => (
            <div key={idx} ref={el => featureCardsRef.current[idx] = el} className="hp-feature-card">
              <div className="hp-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {feature.icon}
                </svg>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ecosystem Section */}
      <section className="hp-ecosystem" id="ecosystem">
        <div className="hp-ecosystem-content">
          <div className="hp-section-header left-align">
            <h2>The <span className="hp-title-accent">SmartGate</span> Ecosystem</h2>
            <p>A unified platform bridging the command centre and the mobile experience.</p>
          </div>
          
          <div ref={el => ecosystemCardsRef.current[0] = el} className="hp-ecosystem-card">
            <div className="hp-eco-text">
              <h3>VisitorTrack Command Centre</h3>
              <p>Your centralized dashboard for administrative control. Monitor real-time analytics, manage active zones, and oversee the entire facility's security posture from a robust web interface. Perfect for security personnel and system administrators.</p>
            </div>
            <div className="hp-eco-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
          </div>

          <div ref={el => ecosystemCardsRef.current[1] = el} className="hp-ecosystem-card mobile-eco">
            <div className="hp-eco-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
            </div>
            <div className="hp-eco-text">
              <h3>SmartGate Mobile App</h3>
              <p>The companion app for visitors and employees. Guests receive digital passes instantly, allowing frictionless entry via QR code or NFC. Employees can easily pre-register visitors and manage their own attendance directly from their smartphone.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="hp-how-it-works" id="how-it-works">
        <div className="hp-section-header">
          <h2>Streamlined <span className="hp-title-accent">Workflow</span></h2>
          <p>From arrival to active monitoring in three simple steps.</p>
        </div>
        <div className="hp-steps-timeline">
          {[
            { step: '01', title: 'Pre-Register', desc: 'Guests register securely via their mobile devices before arriving at the premises.' },
            { step: '02', title: 'Instant Badging', desc: 'Passes are provisioned digitally with precisely constrained zone access rights.' },
            { step: '03', title: 'Live Tracking', desc: 'Monitor the visitor\'s live location natively mapped into your digital floorplan.' }
          ].map((item, idx) => (
            <div key={idx} className="hp-step-card">
              <div className="hp-step-number">{item.step}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="hp-stats" id="impact">
        <div className="hp-stats-wrapper">
          <div className="hp-stats-grid">
            {[
              { num: 1500, label: "Daily Visitors" },
              { num: 45, label: "Active Zones" },
              { num: 99, label: "Security Uptime %" },
              { num: 12, label: "Enterprise Nodes" }
            ].map((stat, idx) => (
              <div key={idx} ref={el => statItemsRef.current[idx] = el} className="hp-stat-card">
                <div className="stat-number" data-target={stat.num}>0</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="hp-trust">
        <p className="hp-trust-label">TRUSTED BY INNOVATIVE ENTERPRISES</p>
        <div className="hp-trust-logos">
          <span>Acme Corp</span>
          <span>Globex</span>
          <span>Soylent</span>
          <span>Initech</span>
          <span>Umbrella</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="hp-footer">
        <div className="hp-footer-content">
          <div className="hp-logo-icon" style={{width: 32, height: 32, fontSize: 14}}>VT</div>
          <p>&copy; 2026 VisitorTrack. Redefining Facility Management.</p>
        </div>
      </footer>

    </div>
  );
};

export default HomePage;