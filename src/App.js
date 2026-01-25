import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import VisitorsInside from "./pages/VisitorsInside";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/visitors-inside" element={<VisitorsInside />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
