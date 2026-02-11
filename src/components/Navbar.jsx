import "../styles/navbar.css";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // Go to homepage
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-left">VisitorTrack</div>

      <div className="nav-right">
        <span className="admin-name">Admin</span>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
