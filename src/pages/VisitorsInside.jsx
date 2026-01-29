import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import HistoryModal from "../components/HistoryModal";
import "../styles/dashboard.css";

import { db } from "../firebase";
import { ref, onValue } from "firebase/database";

// normalize names to avoid manual-entry mismatch
const normalizeName = (name = "") =>
  name.toLowerCase().trim().replace(/\s+/g, " ");

function VisitorsInside() {
  const [firebaseVisitors, setFirebaseVisitors] = useState([]);
  const [flaskVisitors, setFlaskVisitors] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [selectedVisitorName, setSelectedVisitorName] = useState(null);
  
  // ---------------------------------
  // 1️⃣ Firebase realtime listener
  // ---------------------------------
  useEffect(() => {
    const visitorRef = ref(db, "visitorRequests");

    const unsubscribe = onValue(visitorRef, (snapshot) => {
      if (!snapshot.exists()) {
        setFirebaseVisitors([]);
        return;
      }

      const data = snapshot.val();

      const inside = Object.keys(data)
        .map((key) => ({
          id: key,
          ...data[key],
        }))
        .filter((v) => v.status === "INSIDE");

      setFirebaseVisitors(inside);
    });

    return () => unsubscribe();
  }, []);

  // ---------------------------------
  // 2️⃣ Flask polling (every 1 second)
  // ---------------------------------
  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/visitors`
        );
        const data = await res.json();
        setFlaskVisitors(data);
      } catch (err) {
        console.error("Flask fetch error:", err);
        setFlaskVisitors([]);
      }
    };

    // initial fetch
    fetchTracking();

    // poll every 1s
    const interval = setInterval(fetchTracking, 1000);

    return () => clearInterval(interval);
  }, []);

  // ---------------------------------
  // 3️⃣ Merge Firebase + Flask
  // ---------------------------------
  useEffect(() => {
    const merged = firebaseVisitors.map((fv) => {
      const loc = flaskVisitors.find(
        (f) =>
          normalizeName(f.name) === normalizeName(fv.name)
      );

      return {
        ...fv,
        current: loc?.current ?? "-",
        history: loc?.history ?? [],
        in: loc?.in ?? "-",
        out: loc?.out ?? null,
      };
    });

    setVisitors(merged);
  }, [firebaseVisitors, flaskVisitors]);

  const selectedVisitor = visitors.find(
    (v) => v.name === selectedVisitorName
  );

  return (
    <>
      <Navbar />

      <div className="dashboard-container">
        <h2>Visitors Currently Inside</h2>

        <div className="table-card">
          <table className="visitor-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Name</th>
                <th>In Time</th>
                <th>Out Time</th>
                <th>Current Zone</th>
                <th>History</th>
              </tr>
            </thead>

            <tbody>
              {visitors.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    No visitors inside
                  </td>
                </tr>
              ) : (
                visitors.map((v, index) => (
                  <tr key={v.id}>
                    <td>{index + 1}</td>
                    <td>{v.name}</td>
                    <td>{v.in}</td>
                    <td>{v.out || "-"}</td>
                    <td>{v.current}</td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() =>
                          setSelectedVisitorName(v.name)
                        }
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

      {selectedVisitor && (
        <HistoryModal
          visitor={selectedVisitor}
          onClose={() => setSelectedVisitorName(null)}
        />
      )}
    </>
  );
}

export default VisitorsInside;
