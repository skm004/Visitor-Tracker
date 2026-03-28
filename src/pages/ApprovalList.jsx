import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue, update } from "firebase/database";
import "../styles/dashboard.css";

function ApprovalList() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [flaggedRequests, setFlaggedRequests] = useState([]);
  // For flagged rows — stores the original profile name for comparison
  const [profileNames, setProfileNames] = useState({});

  // ── Real-time listener for both PENDING and FLAGGED ──────────────
  useEffect(() => {
    const unsub = onValue(ref(db, "visitorRequests"), (snapshot) => {
      if (!snapshot.exists()) {
        setPendingRequests([]);
        setFlaggedRequests([]);
        return;
      }
      const data = snapshot.val();
      const list = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
      setPendingRequests(list.filter((v) => v.status === "PENDING"));
      setFlaggedRequests(list.filter((v) => v.status === "FLAGGED"));
    });
    return () => unsub();
  }, []);

  // ── For each flagged request, fetch the original profile name ────
  // so admin can see "submitted as X, previously registered as Y"
  useEffect(() => {
    if (flaggedRequests.length === 0) return;
    flaggedRequests.forEach((v) => {
      if (!v.idType || !v.idNumber) return;
      const key = `${v.idType}-${v.idNumber.toUpperCase().trim()}`;
      onValue(ref(db, `visitorProfiles/${key}`), (snap) => {
        if (snap.exists()) {
          const savedName = snap.val().name || "";
          setProfileNames((prev) => ({ ...prev, [v.id]: savedName }));
        }
      }, { onlyOnce: true });
    });
  }, [flaggedRequests]);

  // ── Approve ───────────────────────────────────────────────────────
  const approveVisitor = async (id, existingDate) => {
    const today = new Date().toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
    try {
      await update(ref(db, `visitorRequests/${id}`), {
        status: "APPROVED",
        visitDate: existingDate || today,
        isFlagged: false,
      });
    } catch (err) {
      console.error("Approve failed:", err);
    }
  };

  // ── Reject ────────────────────────────────────────────────────────
  const handleReject = async (visitorId) => {
    const confirmReject = window.confirm(
      "Are you sure you want to reject this visitor?"
    );
    if (!confirmReject) return;
    try {
      await update(ref(db, `visitorRequests/${visitorId}`), {
        status: "REJECTED",
        rejectedAt: Date.now(),
      });
    } catch (error) {
      console.error("Error rejecting visitor:", error);
      alert("Failed to reject visitor");
    }
  };

  return (
    <>
      <Navbar />

      <div className="dashboard-container">
        <h2>Approval Requests</h2>

        {/* ══════════════════════════════════════════
            SECTION 1 — PENDING REQUESTS
        ══════════════════════════════════════════ */}
        <div className="section-label" style={{ marginTop: "8px" }}>
          Pending Requests
        </div>

        <div className="table-card">
          <table className="visitor-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Purpose</th>
                <th>Person To Meet</th>
                <th>Visit Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "44px", color: "#9ca3af", fontStyle: "italic" }}>
                    No pending requests
                  </td>
                </tr>
              ) : (
                pendingRequests.map((v, index) => (
                  <tr key={v.id}>
                    <td>{index + 1}</td>
                    <td style={{ fontWeight: 700 }}>{v.name}</td>
                    <td>{v.phone}</td>
                    <td>{v.purpose}</td>
                    <td>{v.personToMeet}</td>
                    <td>{v.visitDate || "-"}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="approve-btn"
                          onClick={() => approveVisitor(v.id, v.visitDate)}>
                          Approve
                        </button>
                        <button className="reject-btn"
                          style={{ marginLeft: "8px" }}
                          onClick={() => handleReject(v.id)}>
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

        {/* ══════════════════════════════════════════
            SECTION 2 — FLAGGED REQUESTS
            Shown always — empty state if none
        ══════════════════════════════════════════ */}
        <div className="section-label" style={{ marginTop: "36px" }}>
          🚩 Flagged Requests
          {flaggedRequests.length > 0 && (
            <span style={{
              marginLeft: "10px", fontSize: "11px", fontWeight: 700,
              padding: "3px 10px", borderRadius: "100px",
              background: "rgba(239,68,68,0.10)", color: "#ef4444",
              border: "1px solid rgba(239,68,68,0.22)"
            }}>
              {flaggedRequests.length} need{flaggedRequests.length === 1 ? "s" : ""} review
            </span>
          )}
        </div>

        <div className="table-card">

          {/* Explanation banner */}
          <div style={{
            marginBottom: "18px", padding: "12px 16px", borderRadius: "12px",
            background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)",
            fontSize: "12px", color: "#b91c1c", lineHeight: "1.6"
          }}>
            ⚠️ These visitors submitted a request using an ID that was previously registered
            under a <strong>different name</strong>. Review the submitted name vs the
            originally registered name before approving or rejecting.
          </div>

          <table className="visitor-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Submitted Name</th>
                <th>Registered Name</th>
                <th>ID Type</th>
                <th>Phone</th>
                <th>Purpose</th>
                <th>Visit Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {flaggedRequests.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "44px", color: "#9ca3af", fontStyle: "italic" }}>
                    No flagged requests — all clear ✓
                  </td>
                </tr>
              ) : (
                flaggedRequests.map((v, index) => {
                  const registeredName = profileNames[v.id] || "Loading...";
                  const namesMatch = registeredName.trim().toLowerCase() === v.name?.trim().toLowerCase();

                  return (
                    <tr key={v.id} style={{ background: "rgba(239,68,68,0.03)" }}>
                      <td>{index + 1}</td>

                      {/* Submitted name — highlight if different */}
                      <td>
                        <span style={{
                          fontWeight: 700,
                          color: namesMatch ? "#1e1b4b" : "#ef4444"
                        }}>
                          {v.name}
                        </span>
                        {!namesMatch && (
                          <span style={{
                            marginLeft: "6px", fontSize: "10px",
                            padding: "2px 7px", borderRadius: "100px",
                            background: "rgba(239,68,68,0.10)", color: "#ef4444",
                            border: "1px solid rgba(239,68,68,0.22)"
                          }}>
                            mismatch
                          </span>
                        )}
                      </td>

                      {/* Originally registered name */}
                      <td style={{ color: "#059669", fontWeight: 600 }}>
                        {registeredName}
                      </td>

                      {/* ID type badge */}
                      <td>
                        <span style={{
                          padding: "3px 10px", borderRadius: "100px",
                          fontSize: "11px", fontWeight: 700,
                          background: "rgba(124,58,237,0.10)", color: "#7c3aed",
                          border: "1px solid rgba(124,58,237,0.22)"
                        }}>
                          {v.idType || "—"}
                        </span>
                      </td>

                      <td>{v.phone}</td>
                      <td style={{ maxWidth: "130px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {v.purpose}
                      </td>
                      <td>{v.visitDate || "-"}</td>

                      <td>
                        <div className="action-buttons">
                          <button className="approve-btn"
                            onClick={() => approveVisitor(v.id, v.visitDate)}
                            title="Approve despite name mismatch">
                            Approve
                          </button>
                          <button className="reject-btn"
                            style={{ marginLeft: "8px" }}
                            onClick={() => handleReject(v.id)}
                            title="Reject this flagged request">
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>
    </>
  );
}

export default ApprovalList;