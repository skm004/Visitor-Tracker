import { useEffect, useRef } from "react";
import "../styles/navbar.css";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

function Navbar() {
  const navRef   = useRef(null);
  const leftRef  = useRef(null);
  const rightRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    gsap.to(navRef.current, {
      opacity: 0, y: -10, duration: 0.3, ease: "power2.in",
      onComplete: async () => {
        try { await signOut(auth); navigate("/"); }
        catch (e) { console.log(e); gsap.to(navRef.current, { opacity: 1, y: 0, duration: 0.3 }); }
      },
    });
  };

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(navRef.current,  { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6 });
    tl.fromTo(leftRef.current, { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.5 }, "-=0.3");
    tl.fromTo(Array.from(rightRef.current?.children ?? []),
      { opacity: 0, x: 16 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.1 }, "-=0.4");
  }, []);

  return (
    <nav className="navbar" ref={navRef}>
      <div className="nav-left" ref={leftRef}>
        Visitor<span className="nav-brand-accent">Track</span>
      </div>
      <div className="nav-right" ref={rightRef}>
        <div className="admin-badge">
          <span className="admin-dot" />
          <span className="admin-name">Admin</span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;