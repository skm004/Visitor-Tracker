import Navbar from "../components/Navbar";
import DashboardCard from "../components/DashboardCard";
import StatCard from "../components/StatCard";
import "../styles/dashboard.css";
import VisitorTrendChart from "../components/VisitorTrendChart";
import ZoneWidget from "../components/ZoneWidget";

function AdminDashboard() {
  return (
    <>
      <Navbar />

      <div className="dashboard-container">
        <h2>Admin Dashboard</h2>

        {/* Stats Section */}
        <div className="stats-grid">
          <StatCard title="Pending Approvals" value="5" />
          <StatCard title="Visitors Inside" value="12" />
          <StatCard title="Today's Visitors" value="28" />
          <StatCard title="Active Wi-Fi Nodes" value="4" />
        </div>

        {/* Main Sections */}
        <div className="card-grid">
          <DashboardCard
            title="Approval Requests"
            description="Approve or reject visitor entry requests"
          />

          <DashboardCard
            title="Visitors Inside"
            description="Track visitors using Wi-Fi RSSI triangulation"
            link="/visitors-inside"
          />

          <DashboardCard
            title="Visitor Records"
            description="Past and upcoming approved visits"
          />
        </div>

        {/* <div className="widgets-grid">
          <VisitorTrendChart />
          <ZoneWidget />
        </div> */}
      </div>
    </>
  );
}

export default AdminDashboard;
