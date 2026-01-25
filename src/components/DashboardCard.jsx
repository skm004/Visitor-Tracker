import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

function DashboardCard({ title, description, link }) {
  const navigate = useNavigate();

  return (
    <div
      className="dashboard-card"
      onClick={() => link && navigate(link)}
    >
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export default DashboardCard;
