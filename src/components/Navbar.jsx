import "../styles/navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-left">VisitorTrack</div>

      <div className="nav-right">
        <span className="admin-name">Admin</span>
        <button className="logout-btn">Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
