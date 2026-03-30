import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./components/HomePage";
import Login from './components/login';
import Signup from './components/Signup';
import AdminDashboard from "./pages/AdminDashboard";
import VisitorsInside from "./pages/VisitorsInside";
import ApprovalList from "./pages/ApprovalList";
import GatePortal from "./pages/GatePortal";
import HistoryPage from "./pages/HistoryPage";
import FloatingThemeToggle from "./components/FloatingThemeToggle";

const ThemeToggleWrapper = () => {
  const location = useLocation();
  if (location.pathname === '/') return null;
  return <FloatingThemeToggle />;
};

function App() {
  return (
    <BrowserRouter>
      <ThemeToggleWrapper />
      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* Admin Authentication */}
        <Route path="/admin" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Dashboard Pages */}
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/approvals" element={<ApprovalList />} />
        <Route path="/visitors-inside" element={<VisitorsInside />} />
        <Route path="/gate" element={<GatePortal />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;