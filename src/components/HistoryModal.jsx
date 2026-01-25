import "../styles/dashboard.css";

function HistoryModal({ visitor, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{visitor.name} - Movement History</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <ul className="history-list">
          {visitor.history.map((h, i) => (
            <li key={i}>
              <span>{h.time}</span>
              <span>{h.zone}</span>
            </li>
          ))}
          {visitor.out == null ? (
  <li className="live-row">
    <span>LIVE</span>
    <span>{visitor.current}</span>
  </li>
) : (
  <li className="exit-row">
    <span>Exited</span>
    <span>{visitor.out}</span>
  </li>
)}

        </ul>
      </div>
    </div>
  );
}

export default HistoryModal;
