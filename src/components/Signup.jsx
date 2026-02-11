import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ref, get, set } from "firebase/database";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const Signup = () => {
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const titleRef = useRef(null);
  const inputRefs = useRef([]);
  const buttonRef = useRef(null);
  const linkRef = useRef(null);
  const particleRefs = useRef([]);
  const waveRefs = useRef([]);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {

      // Initial setup
      gsap.set(formRef.current, { opacity: 0, scale: 0.9, rotationY: -15 });
      gsap.set(titleRef.current, { opacity: 0, y: -40, rotationX: -20 });
      gsap.set(inputRefs.current, { opacity: 0, x: 50, rotationY: 10 });
      gsap.set(buttonRef.current, { opacity: 0, y: 30 });
      gsap.set(linkRef.current, { opacity: 0 });
      gsap.set(particleRefs.current, { opacity: 0, scale: 0, y: 100 });

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.to(particleRefs.current, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 1.5,
        stagger: { amount: 0.8, from: 'random' },
        ease: 'elastic.out(1, 0.5)',
      });

      tl.to(formRef.current, {
        opacity: 1,
        scale: 1,
        rotationY: 0,
        duration: 1.2,
        ease: 'power4.out',
      }, '-=1');

      tl.to(titleRef.current, {
        opacity: 1,
        y: 0,
        rotationX: 0,
        duration: 0.8,
        ease: 'back.out(2)',
      }, '-=0.8');

      tl.to(inputRefs.current, {
        opacity: 1,
        x: 0,
        rotationY: 0,
        duration: 0.7,
        stagger: 0.12,
      }, '-=0.5');

      tl.to(buttonRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'bounce.out',
      }, '-=0.3');

      tl.to(linkRef.current, {
        opacity: 1,
        duration: 0.5,
      }, '-=0.2');

      // Floating particles animation
      particleRefs.current.forEach((particle, index) => {
        if (particle) {
          gsap.to(particle, {
            y: gsap.utils.random(-30, 30),
            x: gsap.utils.random(-20, 20),
            duration: gsap.utils.random(3, 6),
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: index * 0.2,
          });
        }
      });

      // Wave animation
      waveRefs.current.forEach((wave, index) => {
        if (wave) {
          gsap.to(wave, {
            x: '-100%',
            duration: 15 + index * 5,
            repeat: -1,
            ease: 'none',
          });
        }
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleInputFocus = (e) => {
    gsap.to(e.target.parentElement, {
      scale: 1.03,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleInputBlur = (e) => {
    gsap.to(e.target.parentElement, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleButtonHover = () => {
    gsap.to(buttonRef.current, {
      scale: 1.08,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleButtonLeave = () => {
    gsap.to(buttonRef.current, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {

            // 🔎 Check if any admin already exists
            const snapshot = await get(ref(db, "admins"));

            if (snapshot.exists()) {
            alert("Admin account already created. Signup disabled.");
            return;
            }

            // ✅ Create Firebase Auth user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            const user = userCredential.user;

            // ✅ Save admin record in Realtime DB
            await set(ref(db, "admins/" + user.uid), {
            fullName,
            email,
            role: "superadmin",
            createdAt: new Date().toISOString()
            });

            alert("Admin account created successfully!");

            navigate("/admin");

        } catch (error) {
            alert(error.message);
        }
    };

  return (
    <div ref={containerRef} style={styles.container}>

      {/* Waves */}
      <div style={styles.waveContainer}>
        <svg
          ref={(el) => (waveRefs.current[0] = el)}
          style={styles.wave}
          viewBox="0 0 1200 120"
        >
          <path
            d="M0,50 C150,80 350,0 600,50 C850,100 1050,20 1200,50 L1200,120 L0,120 Z"
            fill="rgba(251, 191, 36, 0.1)"
          />
        </svg>
      </div>

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          ref={(el) => (particleRefs.current[i] = el)}
          style={{
            ...styles.particle,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 8 + 4}px`,
            height: `${Math.random() * 8 + 4}px`,
          }}
        />
      ))}

      {/* Form */}
      <div ref={formRef} style={styles.formContainer}>

        {/* ❌ Star removed */}

        <h1 ref={titleRef} style={styles.title}>
          Create Account
        </h1>

        <p style={styles.subtitle}>
          Join us and start your journey
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputWrapper}>
            <input
              ref={(el) => (inputRefs.current[0] = el)}
              type="text"
              placeholder="Full Name"
              style={styles.input}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              required
            />
          </div>

          <div style={styles.inputWrapper}>
            <input
              ref={(el) => (inputRefs.current[1] = el)}
              type="email"
              placeholder="Email"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              required
            />
          </div>

          <div style={styles.inputWrapper}>
            <input
              ref={(el) => (inputRefs.current[2] = el)}
              type="password"
              placeholder="Password"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              required
            />
          </div>

          <div style={styles.inputWrapper}>
            <input
              ref={(el) => (inputRefs.current[3] = el)}
              type="password"
              placeholder="Confirm Password"
              style={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              required
            />
          </div>

          <button
            ref={buttonRef}
            type="submit"
            style={styles.button}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          >
            Create Account
          </button>

          <div ref={linkRef} style={styles.loginLink}>
            Already have an account?{' '}
            <a
              onClick={() => navigate("/admin")}
              style={{ ...styles.linkBold, cursor: "pointer" }}
            >
              Sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;



const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e293b 100%)',
    fontFamily: '"Manrope", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    position: 'relative',
    overflow: 'hidden',
    padding: '20px',
  },
  waveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '200%',
    height: '120px',
    zIndex: 1,
  },
  wave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '200%',
    height: '100%',
  },
  particle: {
    position: 'absolute',
    background: 'radial-gradient(circle, rgba(251, 191, 36, 0.8) 0%, transparent 70%)',
    borderRadius: '50%',
    zIndex: 1,
    filter: 'blur(2px)',
  },
  formContainer: {
    background: 'rgba(255, 255, 255, 0.06)',
    backdropFilter: 'blur(25px)',
    borderRadius: '28px',
    padding: '45px 40px',
    width: '100%',
    maxWidth: '480px',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    boxShadow: '0 30px 70px rgba(0, 0, 0, 0.5)',
    position: 'relative',
    zIndex: 10,
  },
  iconContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  icon: {
    fontSize: '48px',
    animation: 'pulse 2s ease-in-out infinite',
  },
  title: {
    fontSize: '38px',
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: '6px',
    textAlign: 'center',
    letterSpacing: '-0.8px',
    background: 'linear-gradient(135deg, #fbbf24 0%, #fb923c 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'center',
    marginBottom: '35px',
    fontWeight: '400',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
    position: 'relative',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
    marginLeft: '6px',
    letterSpacing: '0.3px',
  },
  input: {
    padding: '14px 18px',
    fontSize: '14px',
    border: '1px solid rgba(251, 191, 36, 0.25)',
    borderRadius: '14px',
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#ffffff',
    outline: 'none',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '5px',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    accentColor: '#fbbf24',
  },
  checkboxLabel: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.75)',
    cursor: 'pointer',
  },
  link: {
    color: '#fbbf24',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'color 0.3s ease',
  },
  button: {
    padding: '15px',
    fontSize: '15px',
    fontWeight: '700',
    color: '#1e293b',
    background: 'linear-gradient(135deg, #fbbf24 0%, #fb923c 100%)',
    border: 'none',
    borderRadius: '14px',
    cursor: 'pointer',
    marginTop: '10px',
    boxShadow: '0 10px 30px rgba(251, 191, 36, 0.3)',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
    letterSpacing: '0.5px',
  },
  loginLink: {
    textAlign: 'center',
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.65)',
    marginTop: '6px',
  },
  linkBold: {
    color: '#fbbf24',
    textDecoration: 'none',
    fontWeight: '700',
    transition: 'color 0.3s ease',
  },
};
