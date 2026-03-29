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
  const heroRef = useRef(null);
  const heroTitleRef = useRef(null);
  const heroSubtitleRef = useRef(null);
  const heroButtonsRef = useRef(null);
  const shape1Ref = useRef(null);
  const shape2Ref = useRef(null);
  const featureCardsRef = useRef([]);
  const statItemsRef = useRef([]);
  const ecosystemCardsRef = useRef([]);
  const sectionHeadersRef = useRef([]);
  const stepCardsRef = useRef([]);
  const trustLogosRef = useRef([]);

  // Scroll-pinned story refs
  const storyWrapperRef = useRef(null);
  const storyPanelsRef = useRef([]);

  // Integration section refs
  const integrationImgRef = useRef(null);
  const mobileImgRef = useRef(null);
  const dashboardImgRef = useRef(null);

  const storySteps = [
    {
      img: '/images/step1-wifi-tracking.png',
      tag: 'Step 01',
      title: 'Visitor Arrives',
      desc: 'As the visitor enters the premises, Wi-Fi access points instantly detect their device and begin triangulation — mapping their position in real time.',
    },
    {
      img: '/images/step2-registration.png',
      tag: 'Step 02',
      title: 'Self-Registration on SmartGate',
      desc: 'The visitor opens the SmartGate app on their phone and fills in the check-in form. Digital ID, purpose of visit, and host details — all captured in seconds.',
    },
    {
      img: '/images/step3-approved.png',
      tag: 'Step 03',
      title: 'Admin Approves Entry',
      desc: 'The request appears on the VisitorTrack Command Centre instantly. The admin reviews, approves with one tap, and a digital pass is issued to the visitor\'s phone.',
    },
    {
      img: '/images/step4-monitoring.png',
      tag: 'Step 04',
      title: 'Live Tracking & Oversight',
      desc: 'The visitor is now tracked on the interactive floor plan. Security monitors zones, dwell times, and movement patterns — total intelligence, zero friction.',
    },
  ];

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {

      // ── Navbar: float in + compact on scroll ──────────────────
      if (navRef.current) {
        gsap.from(navRef.current, {
          y: -80, opacity: 0, duration: 1.2, ease: 'power4.out', delay: 0.1
        });
        ScrollTrigger.create({
          trigger: heroRef.current,
          start: 'bottom top+=100',
          onEnter: () => navRef.current?.classList.add('hp-nav--compact'),
          onLeaveBack: () => navRef.current?.classList.remove('hp-nav--compact'),
        });
      }

      // ── Hero: entrance ────────────────────────────────────────
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from(heroTitleRef.current, { y: 40, opacity: 0, duration: 1, delay: 0.3 })
        .from(heroSubtitleRef.current, { y: 30, opacity: 0, duration: 0.8 }, "-=0.6")
        .from(heroButtonsRef.current, { y: 20, opacity: 0, duration: 0.8 }, "-=0.5");

      // ── Hero: parallax fade-out ───────────────────────────────
      if (heroRef.current) {
        gsap.to(heroRef.current, {
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
          y: -80, opacity: 0, ease: 'none',
        });
      }

      // ── Background shapes ─────────────────────────────────────
      gsap.to(shape1Ref.current, {
        y: -40, x: 30, rotation: 5, duration: 6, repeat: -1, yoyo: true, ease: 'sine.inOut'
      });
      gsap.to(shape2Ref.current, {
        y: 40, x: -30, rotation: -5, duration: 7, repeat: -1, yoyo: true, ease: 'sine.inOut'
      });

      // ════════════════════════════════════════════════════════════
      // SCROLL-PINNED STORY SECTION
      // The section pins and images reveal one-by-one as you scroll
      // ════════════════════════════════════════════════════════════
      if (storyWrapperRef.current && storyPanelsRef.current.length) {
        const panels = storyPanelsRef.current.filter(Boolean);

        // Each panel starts hidden
        panels.forEach((panel) => {
          gsap.set(panel, { opacity: 0, y: 60, scale: 0.92 });
        });

        // Show first panel immediately when pinned
        gsap.set(panels[0], { opacity: 1, y: 0, scale: 1 });

        const storyTl = gsap.timeline({
          scrollTrigger: {
            trigger: storyWrapperRef.current,
            start: 'top top',
            end: () => `+=${panels.length * 100}%`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
          }
        });

        // Animate each panel: fade out current → fade in next
        panels.forEach((panel, i) => {
          if (i < panels.length - 1) {
            // Fade out current panel
            storyTl.to(panel, {
              opacity: 0, y: -40, scale: 0.95, duration: 0.4
            });
            // Fade in next panel
            storyTl.to(panels[i + 1], {
              opacity: 1, y: 0, scale: 1, duration: 0.6
            }, '-=0.15');
          }
        });
      }

      // ── Integration Images: scrub-linked reveal ───────────────
      if (integrationImgRef.current) {
        gsap.from(integrationImgRef.current, {
          scrollTrigger: {
            trigger: integrationImgRef.current,
            start: 'top 90%',
            end: 'top 50%',
            scrub: 0.6,
          },
          opacity: 0, scale: 0.8, y: 40, ease: 'none'
        });
      }
      if (mobileImgRef.current) {
        gsap.from(mobileImgRef.current, {
          scrollTrigger: {
            trigger: mobileImgRef.current,
            start: 'top 90%',
            end: 'top 55%',
            scrub: 0.6,
          },
          opacity: 0, x: -100, rotation: -6, ease: 'none'
        });
      }
      if (dashboardImgRef.current) {
        gsap.from(dashboardImgRef.current, {
          scrollTrigger: {
            trigger: dashboardImgRef.current,
            start: 'top 90%',
            end: 'top 55%',
            scrub: 0.6,
          },
          opacity: 0, x: 100, rotation: 6, ease: 'none'
        });
      }

      // ── Section Headers: blur reveal (scrub) ──────────────────
      sectionHeadersRef.current.forEach((header) => {
        if (!header) return;
        gsap.from(header, {
          scrollTrigger: {
            trigger: header,
            start: 'top 92%',
            end: 'top 65%',
            scrub: 0.5,
          },
          opacity: 0, y: 50, filter: 'blur(8px)', ease: 'none'
        });
      });

      // ── Feature Cards: stagger (scrub) ────────────────────────
      featureCardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            end: 'top 65%',
            scrub: 0.5,
          },
          opacity: 0, y: 50, ease: 'none'
        });
      });

      // ── Ecosystem Cards: slide + rotation (scrub) ─────────────
      ecosystemCardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            end: 'top 60%',
            scrub: 0.5,
          },
          opacity: 0, x: i % 2 === 0 ? -70 : 70, rotation: i % 2 === 0 ? -3 : 3,
          ease: 'none'
        });
      });

      // ── Step Cards: domino (scrub) ────────────────────────────
      stepCardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            end: 'top 65%',
            scrub: 0.5,
          },
          opacity: 0, y: 60, scale: 0.88, ease: 'none'
        });
      });

      // ── Stat Cards: bounce-in + counter ────────────────────────
      statItemsRef.current.forEach((stat, i) => {
        if (!stat) return;
        const numberElement = stat.querySelector('.stat-number');
        if (!numberElement) return;
        const target = parseInt(numberElement.dataset.target, 10);
        let counted = false;

        gsap.from(stat, {
          scrollTrigger: {
            trigger: stat,
            start: 'top 85%',
            end: 'top 60%',
            scrub: 0.5,
            onEnter: () => {
              if (counted) return;
              counted = true;
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
            },
          },
          opacity: 0, scale: 0.7, y: 30, ease: 'none'
        });
      });

      // ── Trust Logos: stagger fade ──────────────────────────────
      trustLogosRef.current.forEach((logo, i) => {
        if (!logo) return;
        gsap.from(logo, {
          scrollTrigger: {
            trigger: logo,
            start: 'top 95%',
            end: 'top 80%',
            scrub: 0.3,
          },
          opacity: 0, y: 20, ease: 'none'
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
          <li><button onClick={() => scrollToSection('journey')}>Journey</button></li>
          <li><button onClick={() => scrollToSection('impact')}>Impact</button></li>
        </ul>
        <button className="hp-nav-cta" onClick={() => navigateWithFlip('/admin')}>
          Command Centre
        </button>
      </nav>

      {/* ═══════════════════════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="hp-hero" id="home">
        <div className="hp-hero-content">
          <div ref={heroTitleRef}>
            <span className="hp-badge">Web + Mobile · Fully Integrated</span>
            <h1 className="hp-title">
              One Ecosystem.<br/>
              <span className="hp-title-accent">Total Visitor Intelligence.</span>
            </h1>
          </div>
          <p ref={heroSubtitleRef} className="hp-subtitle">
            Visitors check in through SmartGate mobile — admins track, approve
            &amp; monitor through VisitorTrack web. Two platforms, one seamless
            security experience.
          </p>
          <div ref={heroButtonsRef} className="hp-buttons">
            <button className="hp-btn-primary" onClick={() => navigateWithFlip('/admin')}>
              Open Command Centre
            </button>
            <button className="hp-btn-secondary" onClick={() => scrollToSection('journey')}>
              See the Journey ↓
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SCROLL-PINNED STORY — The Visitor Journey
          This section pins to the viewport. As the user scrolls,
          each step image + text fades in/out sequentially.
          ═══════════════════════════════════════════════════════════ */}
      <section ref={storyWrapperRef} className="hp-story" id="journey">
        <div className="hp-story-progress">
          {storySteps.map((_, i) => (
            <div key={i} className="hp-story-progress-dot" />
          ))}
        </div>

        {storySteps.map((step, i) => (
          <div
            key={i}
            ref={el => storyPanelsRef.current[i] = el}
            className="hp-story-panel"
          >
            <div className="hp-story-image-wrapper">
              <img src={step.img} alt={step.title} className="hp-story-image" />
            </div>
            <div className="hp-story-text">
              <span className="hp-story-tag">{step.tag}</span>
              <h2 className="hp-story-title">{step.title}</h2>
              <p className="hp-story-desc">{step.desc}</p>
            </div>
          </div>
        ))}

        <div className="hp-story-scroll-hint">
          <span>Scroll to explore the journey</span>
          <div className="hp-story-scroll-arrow">↓</div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          INTEGRATION SHOWCASE — Side by side platform cards
          ═══════════════════════════════════════════════════════════ */}
      <section className="hp-integration-showcase" id="integration">
        <div ref={el => sectionHeadersRef.current[0] = el} className="hp-section-header">
          <h2>Two Platforms. <span className="hp-title-accent">One Flow.</span></h2>
          <p>See how SmartGate mobile and VisitorTrack web work together in real time.</p>
        </div>
        <div ref={integrationImgRef} className="hp-integration-image-wrapper">
          <img
            src="/images/integration-flow.png"
            alt="SmartGate mobile and VisitorTrack web integration flow"
            className="hp-integration-img"
          />
        </div>
        <div className="hp-integration-sides">
          <div ref={mobileImgRef} className="hp-side-card">
            <img
              src="/images/smartgate-mobile.png"
              alt="SmartGate mobile app check-in screen"
              className="hp-side-img"
            />
            <div className="hp-side-label">
              <span className="hp-side-tag">Mobile</span>
              <h3>SmartGate App</h3>
              <p>Visitor self-registration, digital passes &amp; QR check-in</p>
            </div>
          </div>
          <div ref={dashboardImgRef} className="hp-side-card">
            <img
              src="/images/visitortrack-dashboard.png"
              alt="VisitorTrack admin dashboard"
              className="hp-side-img"
            />
            <div className="hp-side-label">
              <span className="hp-side-tag">Web</span>
              <h3>Command Centre</h3>
              <p>Real-time tracking, approvals &amp; analytics dashboard</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FEATURES SECTION
          ═══════════════════════════════════════════════════════════ */}
      <section className="hp-features" id="features">
        <div ref={el => sectionHeadersRef.current[1] = el} className="hp-section-header">
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

      {/* ═══════════════════════════════════════════════════════════
          ECOSYSTEM SECTION
          ═══════════════════════════════════════════════════════════ */}
      <section className="hp-ecosystem" id="ecosystem">
        <div className="hp-ecosystem-content">
          <div ref={el => sectionHeadersRef.current[2] = el} className="hp-section-header left-align">
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

      {/* ═══════════════════════════════════════════════════════════
          HOW IT WORKS
          ═══════════════════════════════════════════════════════════ */}
      <section className="hp-how-it-works" id="how-it-works">
        <div ref={el => sectionHeadersRef.current[3] = el} className="hp-section-header">
          <h2>Streamlined <span className="hp-title-accent">Workflow</span></h2>
          <p>From arrival to active monitoring in three simple steps.</p>
        </div>
        <div className="hp-steps-timeline">
          {[
            { step: '01', title: 'Pre-Register', desc: 'Guests register securely via their mobile devices before arriving at the premises.' },
            { step: '02', title: 'Instant Badging', desc: 'Passes are provisioned digitally with precisely constrained zone access rights.' },
            { step: '03', title: 'Live Tracking', desc: 'Monitor the visitor\'s live location natively mapped into your digital floorplan.' }
          ].map((item, idx) => (
            <div key={idx} ref={el => stepCardsRef.current[idx] = el} className="hp-step-card">
              <div className="hp-step-number">{item.step}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          STATS
          ═══════════════════════════════════════════════════════════ */}
      <section className="hp-stats" id="impact">
        <div ref={el => sectionHeadersRef.current[4] = el} className="hp-stats-wrapper">
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

      {/* Trust */}
      <section className="hp-trust">
        <p className="hp-trust-label">TRUSTED BY INNOVATIVE ENTERPRISES</p>
        <div className="hp-trust-logos">
          {['Acme Corp', 'Globex', 'Soylent', 'Initech', 'Umbrella'].map((name, i) => (
            <span key={i} ref={el => trustLogosRef.current[i] = el}>{name}</span>
          ))}
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