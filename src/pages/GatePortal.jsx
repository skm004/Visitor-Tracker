import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import "../styles/dashboard.css";

import { db } from "../firebase";
import { ref, onValue, update } from "firebase/database";

function GatePortal() {
  const [visitors, setVisitors] = useState([]);

  const BACKEND_URL = "http://localhost:5000";

  // today in consistent format
  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // ----------------------------
  // Firebase realtime listener
  // ----------------------------
  useEffect(() => {
    const visitorRef = ref(db, "visitorRequests");

    const unsubscribe = onValue(visitorRef, (snapshot) => {
      if (!snapshot.exists()) {
        setVisitors([]);
        return;
      }

      const data = snapshot.val();

      const list = Object.keys(data)
        .map((key) => ({
          id: key,
          ...data[key],
        }))
        .filter(
          (v) =>
            v.visitDate === today &&
            (v.status === "APPROVED" || v.status === "INSIDE")
        );

      setVisitors(list);
    });

    return () => unsubscribe();
  }, [today]);

  // ----------------------------
  // Check-In
  // ----------------------------
  const checkIn = async (v) => {
    try {
      // 1️⃣ Notify Flask
      await fetch(`${BACKEND_URL}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: v.name }),
      });

      // 2️⃣ Update Firebase
      await update(ref(db, `visitorRequests/${v.id}`), {
        status: "INSIDE",
      });

    } catch (err) {
      console.error("Check-in failed:", err);
    }
  };

  // ----------------------------
  // Check-Out
  // ----------------------------
  const checkOut = async (v) => {
    try {
      // 1️⃣ Notify Flask
      await fetch(`${BACKEND_URL}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: v.name }),
      });

      // 2️⃣ Update Firebase
      await update(ref(db, `visitorRequests/${v.id}`), {
        status: "EXITED",
      });

      // 🚫 EXITED visitors automatically disappear
    } catch (err) {
      console.error("Check-out failed:", err);
    }
  };

  return (
    <>
      <Navbar />

      <div className="dashboard-container">
        <h2>Gate Portal (Today)</h2>

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
              {visitors.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No visitors inside today
                  </td>
                </tr>
              ) : (
                visitors.map((v, index) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default GatePortal;
