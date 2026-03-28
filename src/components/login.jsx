import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import { ref, get } from "firebase/database";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import '../styles/auth.css';

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const formRef = useRef(null);
  const leftRef = useRef(null);

  // GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 3D Glassmorphic Flip Entrance
      if (formRef.current) {
        gsap.set(formRef.current.parentElement, { perspective: 1200 });
        gsap.fromTo(formRef.current,
          { opacity: 0, scale: 0.9, rotationX: 10, y: 30 },
          { opacity: 1, scale: 1, rotationX: 0, y: 0, duration: 1.2, ease: 'power4.out', delay: 0.1 }
        );
        const fields = formRef.current.querySelectorAll('.gsap-field');
        gsap.fromTo(fields,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out', delay: 0.3 }
        );
      }
      if (leftRef.current) {
        const els = leftRef.current.querySelectorAll('.gsap-left');
        gsap.fromTo(els,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: 'power3.out', delay: 0.2 }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const shakeForm = () => {
    gsap.fromTo(formRef.current, { x: -8 }, { x: 0, duration: 0.45, ease: 'elastic.out(1,0.3)' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) { 
        setError('Please fill in all fields.'); 
        shakeForm(); 
        return; 
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const snapshot = await get(ref(db, 'admins/' + user.uid));

      if (!snapshot.exists()) {
        setLoading(false);
        setError('Access denied. Not an admin.');
        shakeForm();
        return;
      }

      // Success
      gsap.to(formRef.current, {
        scale: 0.95, opacity: 0, duration: 0.3, ease: 'power2.in',
        onComplete: () => {
          navigate('/dashboard', { replace: true });
        },
      });

    } catch (err) {
      setLoading(false);
      const msg =
        err.code === 'auth/invalid-credential' ? 'Wrong email or password.' :
        err.code === 'auth/user-not-found' ? 'No account with this email.' :
        err.code === 'auth/too-many-requests' ? 'Too many attempts. Try later.' :
        'Something went wrong. Try again.';
      setError(msg);
      shakeForm();
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-shape1" />
      <div className="auth-bg-shape2" />

      {/* ── LEFT PANEL ── */}
      <div className="auth-left" ref={leftRef}>
        <div className="auth-brand-logo gsap-left">
          <div className="auth-brand-icon">VT</div>
          <span className="auth-brand-name">VisitorTracker</span>
        </div>

        <h1 className="auth-heading gsap-left">
          Log visitors securely,<br />
          <span className="auth-accent">monitor seamlessly.</span>
        </h1>

        <p className="auth-sub gsap-left">
          Manage your enterprise security, gate approvals, and realtime 
          visitor tracking in a single, intuitive interface.
        </p>

        <div className="auth-features gsap-left">
          {[
            { text: 'Real-time dashboard analytics' },
            { text: 'QR code rapid check-ins' },
            { text: 'Triangulation zone tracking' },
          ].map((f, i) => (
            <div key={i} className="auth-feature">
              <svg className="auth-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="auth-right">
        <div className="auth-form-card" ref={formRef}>
          <h2 className="auth-form-title gsap-field">Welcome Back</h2>
          <p className="auth-form-sub gsap-field">
            Enter your credentials to access the command centre
          </p>

          <form onSubmit={handleSubmit} noValidate>
            
            {/* Email */}
            <div className="auth-input-group gsap-field">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 7l-10 6L2 7" />
                </svg>
                <input
                  type="email"
                  className="auth-input"
                  placeholder="admin@company.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-input-group gsap-field">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPass(p => !p)}
                  tabIndex={-1}
                >
                  {showPass ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="auth-error-box gsap-field">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="auth-submit-btn gsap-field"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Switch */}
          <p className="auth-switch gsap-field">
            Don't have an admin account?{' '}
            <Link to="/signup">Request Setup</Link>
          </p>
        </div>
      </div>
    </div>
  );
}