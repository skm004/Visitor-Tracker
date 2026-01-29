import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import VisitorsInside from "./pages/VisitorsInside";
import ApprovalList from "./pages/ApprovalList";
import GatePortal from "./pages/GatePortal";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/approvals" element={<ApprovalList />} />
        <Route path="/visitors-inside" element={<VisitorsInside />} />
        <Route path="/gate" element={<GatePortal />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
