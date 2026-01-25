import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import HistoryModal from "../components/HistoryModal";
import "../styles/dashboard.css";

function VisitorsInside() {
  const [visitors, setVisitors] = useState([]);
  useEffect(() => {
    fetchVisitors();

    const interval = setInterval(fetchVisitors, 5000); // refresh every 5s

    return () => clearInterval(interval);
  }, []);

  const fetchVisitors = async () => {
    const res = await fetch("http://localhost:5000/visitors");
    const data = await res.json();
    setVisitors(data);
  };

  const [selectedVisitorName, setSelectedVisitorName] = useState(null);
  const selectedVisitor = visitors.find(
  v => v.name === selectedVisitorName
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
              {visitors.map((v, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{v.name}</td>
                  <td>{v.in}</td>
                  <td>{v.out}</td>
                  <td>{v.current}</td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={() => setSelectedVisitorName(v.name)}
                    >
                      {" "}
                      View
                    </button>
                  </td>
                </tr>
              ))}
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
