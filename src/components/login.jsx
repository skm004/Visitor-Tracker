import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ref, get } from "firebase/database";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";


const Login = () => {
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const titleRef = useRef(null);
  const inputRefs = useRef([]);
  const buttonRef = useRef(null);
  const linkRef = useRef(null);
  const orbitRefs = useRef([]);
  const decorRefs = useRef([]);

  // ✅ STATES
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial setup
      gsap.set(formRef.current, { opacity: 0, y: 50 });
      gsap.set(titleRef.current, { opacity: 0, y: -30, scale: 0.9 });
      gsap.set(inputRefs.current, { opacity: 0, x: -30 });
      gsap.set(buttonRef.current, { opacity: 0, scale: 0.8 });
      gsap.set(linkRef.current, { opacity: 0 });
      gsap.set(decorRefs.current, { opacity: 0, scale: 0 });

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.to(decorRefs.current, {
        opacity: 1,
        scale: 1,
        duration: 1.2,
        stagger: 0.15,
        ease: 'elastic.out(1, 0.6)',
      });

      tl.to(formRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
      }, '-=0.6');

      tl.to(titleRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
      }, '-=0.5');

      tl.to(inputRefs.current, {
        opacity: 1,
        x: 0,
        duration: 0.6,
        stagger: 0.15,
      }, '-=0.4');

      tl.to(buttonRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: 'back.out(2)',
      }, '-=0.3');

      tl.to(linkRef.current, {
        opacity: 1,
        duration: 0.5,
      }, '-=0.2');

      // 🔄 Orbit rotation animation
      orbitRefs.current.forEach((orbit, index) => {
        if (orbit) {
          gsap.to(orbit, {
            rotation: 360,
            duration: 20 + index * 5,
            repeat: -1,
            ease: 'none',
          });
        }
      });

      // 🔄 Floating shapes animation
      decorRefs.current.forEach((decor, index) => {
        if (decor) {
          gsap.to(decor, {
            y: '+=20',
            duration: 2 + index * 0.5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
        }
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 🔎 Check if this user is admin
            const snapshot = await get(ref(db, "admins/" + user.uid));

            if (!snapshot.exists()) {
            alert("Access denied. Not an admin.");
            return;
            }

            navigate("/dashboard");

            // navigate to dashboard here

        } catch (error) {
            console.log(error);
            console.log(error.code);
            console.log(error.message);
            alert(error.message);
          }
    };


  return (
    <div ref={containerRef} style={styles.container}>

      {/* Decorative Background Elements */}
      <div
        ref={(el) => (decorRefs.current[0] = el)}
        style={{ ...styles.decorShape, ...styles.shape1 }}
      />
      <div
        ref={(el) => (decorRefs.current[1] = el)}
        style={{ ...styles.decorShape, ...styles.shape2 }}
      />
      <div
        ref={(el) => (decorRefs.current[2] = el)}
        style={{ ...styles.decorShape, ...styles.shape3 }}
      />

      {/* Orbiting elements */}
      <div ref={(el) => (orbitRefs.current[0] = el)} style={styles.orbit1}>
        <div style={styles.orbitDot} />
      </div>
      <div ref={(el) => (orbitRefs.current[1] = el)} style={styles.orbit2}>
        <div style={styles.orbitDot} />
      </div>

      {/* Main Form */}
      <div ref={formRef} style={styles.formContainer}>
        <h1 ref={titleRef} style={styles.title}>
          Welcome Back
        </h1>

        <p style={styles.subtitle}>
          Enter your credentials to continue
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              ref={(el) => (inputRefs.current[0] = el)}
              type="email"
              placeholder="you@example.com"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              ref={(el) => (inputRefs.current[1] = el)}
              type="password"
              placeholder="••••••••"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            ref={buttonRef}
            type="submit"
            style={styles.button}
          >
            Sign In
          </button>

          <div ref={linkRef} style={styles.signupLink}>
            Don't have an account?{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/signup");
              }}
              style={styles.linkBold}
            >
              Sign up
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    fontFamily: '"Outfit", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    position: 'relative',
    overflow: 'hidden',
    padding: '20px',
  },
  decorShape: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(80px)',
    opacity: 0.3,
    zIndex: 1,
  },
  shape1: {
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, #667eea 0%, transparent 70%)',
    top: '-100px',
    left: '-100px',
  },
  shape2: {
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, #f093fb 0%, transparent 70%)',
    bottom: '-150px',
    right: '-150px',
  },
  shape3: {
    width: '300px',
    height: '300px',
    background: 'radial-gradient(circle, #4facfe 0%, transparent 70%)',
    top: '50%',
    right: '10%',
  },
  orbit1: {
    position: 'absolute',
    width: '600px',
    height: '600px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1,
  },
  orbit2: {
    position: 'absolute',
    width: '800px',
    height: '800px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '50%',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1,
  },
  orbitDot: {
    width: '12px',
    height: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '50%',
    boxShadow: '0 0 20px rgba(102, 126, 234, 0.8)',
    position: 'absolute',
    top: '0',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  formContainer: {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px)',
    borderRadius: '30px',
    padding: '50px 45px',
    width: '100%',
    maxWidth: '440px',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)',
    position: 'relative',
    zIndex: 10,
  },
  title: {
    fontSize: '42px',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '8px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '15px',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: '40px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  input: {
    padding: '16px 20px',
    fontSize: '15px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '14px',
    background: 'rgba(255, 255, 255, 0.08)',
    color: '#ffffff',
    outline: 'none',
  },
  button: {
    padding: '16px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '14px',
    cursor: 'pointer',
    marginTop: '12px',
  },
  signupLink: {
    textAlign: 'center',
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: '8px',
  },
  linkBold: {
    color: '#a78bfa',
    textDecoration: 'none',
    fontWeight: '600',
  },
};

export default Login;

