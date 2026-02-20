import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";

function ZoneWidget() {
  const [zoneCounts, setZoneCounts] = useState({});

  useEffect(() => {
    const visitorRef = ref(db, "visitorRequests");

    const unsubscribe = onValue(visitorRef, (snapshot) => {
      if (!snapshot.exists()) {
        setZoneCounts({});
        return;
      }

      const data = snapshot.val();
      const counts = {};

      Object.values(data).forEach((visitor) => {
        if (visitor && visitor.status === "INSIDE" && visitor.currentZone) {
          const zone = visitor.currentZone;
          counts[zone] = (counts[zone] || 0) + 1;
        }
      });

      setZoneCounts(counts);
    });

    return () => unsubscribe;
  }, []);

  const hasZones = Object.keys(zoneCounts).length > 0;

  return (
    <div className="widget-card">
      <h3>Visitors by Zone</h3>
      <ul className="zone-list">
        {hasZones ? (
          Object.entries(zoneCounts).map(([zone, count]) => (
            <li key={zone}>
              <span>{zone}</span>
              <strong>{count}</strong>
            </li>
          ))
        ) : (
          <li><span>No visitors inside</span></li>
        )}
      </ul>
    </div>
  );
}

export default ZoneWidget;