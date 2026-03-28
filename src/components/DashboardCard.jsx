import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

function DashboardCard({ title, description, link, tag }) {
  const navigate = useNavigate();
  return (
    <div className="dashboard-card" onClick={() => link && navigate(link)}>
      <div className="dashboard-card-arrow">↗</div>
      {tag && <div className="dashboard-card-tag">{tag}</div>}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export default DashboardCard;