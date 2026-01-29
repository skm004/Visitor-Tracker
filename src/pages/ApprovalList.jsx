import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, get, update, remove } from "firebase/database";
import "../styles/dashboard.css";

function ApprovalList() {
  const [requests, setRequests] = useState([]);

  // ---------------------------
  // Fetch pending requests
  // ---------------------------
  const fetchRequests = async () => {
    try {
      const snapshot = await get(ref(db, "visitorRequests"));

      if (!snapshot.exists()) {
        setRequests([]);
        return;
      }

      const data = snapshot.val();

      const list = Object.keys(data)
        .map((key) => ({
          id: key,
          ...data[key],
        }))
        .filter((v) => v.status === "PENDING");

      setRequests(list);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    }
  };

  // ---------------------------
  // Approve visitor
  // ---------------------------
  const approveVisitor = async (id) => {
    try {
      await update(ref(db, `visitorRequests/${id}`), {
        status: "APPROVED",
      });

      fetchRequests();
    } catch (err) {
      console.error("Approve failed:", err);
    }
  };

  // ---------------------------
  // Reject visitor (DELETE)
  // ---------------------------
  const handleReject = async (visitorId) => {
    const confirmReject = window.confirm(
      "Are you sure you want to reject and delete this visitor?"
    );

    if (!confirmReject) return;

    try {
      await remove(ref(db, `visitorRequests/${visitorId}`));
      console.log("Visitor rejected and deleted:", visitorId);

      fetchRequests();
    } catch (error) {
      console.error("Error deleting visitor:", error);
      alert("Failed to reject visitor");
    }
  };

  // ---------------------------
  // Auto load on page open
  // ---------------------------
  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <>
      <Navbar />

      <div className="dashboard-container">
        <h2>Approval Requests</h2>

        <div className="table-card">
          <table className="visitor-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Purpose</th>
                <th>Person To Meet</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    No pending requests
                  </td>
                </tr>
              ) : (
                requests.map((v, index) => (
                  <tr key={v.id}>
                    <td>{index + 1}</td>
                    <td>{v.name}</td>
                    <td>{v.phone}</td>
                    <td>{v.purpose}</td>
                    <td>{v.personToMeet}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="approve-btn"
                          onClick={() => approveVisitor(v.id)}
                        >
                          Approve
                        </button>

                        <button
                          className="reject-btn"
                          style={{
                            marginLeft: "8px",
                            background: "#ef4444",
                            color: "white",
                          }}
                          onClick={() => handleReject(v.id)}
                        >
                          Reject
                        </button>
                      </div>
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

export default ApprovalList;
