import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import HistoryModal from "../components/HistoryModal";
import "../styles/dashboard.css";

import { db } from "../firebase";
import { ref, get } from "firebase/database";

function HistoryPage() {
  const [visitors, setVisitors] = useState([]);
  const [selectedVisitor, setSelectedVisitor] = useState(null);

  // ---------------------------
  // Fetch ALL visitors (all dates)
  // ---------------------------
  const fetchAllVisitors = async () => {
  try {
    const snapshot = await get(ref(db, "visitorRequests"));

    if (!snapshot.exists()) {
      setVisitors([]);
      return;
    }

    const data = snapshot.val();

    const isPastOrToday = (dateStr) => {
      if (!dateStr) return false;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const visitDate = new Date(dateStr);
      visitDate.setHours(0, 0, 0, 0);

      return visitDate <= today;
    };

    const list = Object.keys(data)
      .map((key) => ({
        id: key,
        ...data[key],
      }))
      .filter((v) => isPastOrToday(v.visitDate))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    setVisitors(list);
  } catch (err) {
    console.error("Failed to fetch history:", err);
  }
};

  useEffect(() => {
    fetchAllVisitors();
  }, []);

  return (
    <>
      <Navbar />

      <div className="dashboard-container">
        <h2>Visitor History</h2>

        <div className="table-card">
          <table className="visitor-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Visit Date</th>
                <th>Status</th>
                <th>History</th>
              </tr>
            </thead>

            <tbody>
              {visitors.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    No visitor history available
                  </td>
                </tr>
              ) : (
                visitors.map((v, index) => (
                  <tr key={v.id}>
                    <td>{index + 1}</td>
                    <td>{v.name}</td>
                    <td>{v.phone || "-"}</td>
                    <td>{v.visitDate || "-"}</td>
                    <td>
                      <span
                        className={`status-badge ${v.status?.toLowerCase()}`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => setSelectedVisitor(v)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Modal */}
      {selectedVisitor && (
        <HistoryModal
          visitor={selectedVisitor}
          onClose={() => setSelectedVisitor(null)}
        />
      )}
    </>
  );
}

export default HistoryPage;
