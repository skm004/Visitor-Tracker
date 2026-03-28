import "../styles/dashboard.css";

function HistoryModal({ visitor, onClose }) {
  const name = visitor?.name || "Visitor";
  const current = visitor?.current || "-";
  const out = visitor?.out || null;
  const gateInTime = visitor?.in || null;

  // ✅ Filter history to only show entries from current visit
  const allHistory = Array.isArray(visitor?.history) ? visitor.history : [];

  const history = gateInTime
    ? allHistory.filter((h) => {
        if (!h?.time) return false;
        // Compare HH:MM:SS strings directly — current visit entries are after gateInTime
        return h.time >= gateInTime;
      })
    : allHistory;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{name} - Movement History</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <ul className="history-list">
          {history.length === 0 ? (
            <li style={{ textAlign: "center", opacity: 0.7 }}>
              No movement history available
            </li>
          ) : (
            history.map((h, i) => (
              <li key={i}>
                <span>{h?.time || "-"}</span>
                <span>{h?.zone || "-"}</span>
              </li>
            ))
          )}

          {out === null ? (
            <li className="live-row">
              <span>LIVE</span>
              <span>{current}</span>
            </li>
          ) : (
            <li className="exit-row">
              <span>Exited</span>
              <span>{out}</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default HistoryModal;