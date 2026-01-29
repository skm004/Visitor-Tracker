import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import "../styles/dashboard.css";

import { db } from "../firebase";
import { ref, get, update } from "firebase/database";

function GatePortal() {
  const [visitors, setVisitors] = useState([]);

  const BACKEND_URL = "http://localhost:5000";

  // ----------------------------
  // Fetch approved + inside
  // ----------------------------
  const fetchVisitors = async () => {
    const snapshot = await get(ref(db, "visitorRequests"));

    if (!snapshot.exists()) return;

    const data = snapshot.val();

    const list = Object.keys(data)
      .map((key) => ({
        id: key,
        ...data[key],
      }))
      .filter(
        (v) => v.status === "APPROVED" || v.status === "INSIDE"
      );

    setVisitors(list);
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  // ----------------------------
  // Check-In
  // ----------------------------
  const checkIn = async (v) => {
    await fetch(`${BACKEND_URL}/checkin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: v.name }),
    });

    await update(ref(db, `visitorRequests/${v.id}`), {
      status: "INSIDE",
    });

    fetchVisitors();
  };

  // ----------------------------
  // Check-Out
  // ----------------------------
  const checkOut = async (v) => {
    await fetch(`${BACKEND_URL}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: v.name }),
    });

    await update(ref(db, `visitorRequests/${v.id}`), {
      status: "EXITED",
    });

    fetchVisitors();
  };

  return (
    <>
      <Navbar />

      <div className="dashboard-container">
        <h2>Gate Check-In / Check-Out</h2>

        <div className="table-card">
          <table className="visitor-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {visitors.map((v, index) => (
                <tr key={v.id}>
                  <td>{index + 1}</td>
                  <td>{v.name}</td>
                  <td>{v.phone}</td>
                  <td>{v.status}</td>
                  <td>
                    {v.status === "APPROVED" ? (
                      <button
                        className="view-btn"
                        onClick={() => checkIn(v)}
                      >
                        Check-In
                      </button>
                    ) : (
                      <button
                        className="view-btn"
                        style={{
                          background: "#ef4444",
                          color: "white",
                        }}
                        onClick={() => checkOut(v)}
                      >
                        Check-Out
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default GatePortal;
