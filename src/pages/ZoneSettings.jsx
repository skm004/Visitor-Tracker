import { useEffect, useRef, useState } from "react";
import { db } from "../firebase";
import { ref, onValue, set, remove, update } from "firebase/database";
import gsap from "gsap";
import Navbar from "../components/Navbar";
import "../styles/dashboard.css";

// ─────────────────────────────────────────────────────────────────
// Zone Settings — Admin page to manage Wi-Fi zones and mark
// zones as restricted. All config is stored in Firebase so
// changes apply instantly to both the Android app and website.
//
// Firebase structure:
//   config/
//     zones/           → { "bssid": "Zone Name", ... }
//     restrictedZones/ → { "Zone Name": true, ... }
// ─────────────────────────────────────────────────────────────────

function ZoneSettings() {
  // zones: { bssid: zoneName }
  const [zones, setZones] = useState({});
  // restrictedZones: { zoneName: true }
  const [restrictedZones, setRestrictedZones] = useState({});

  // Form state for adding a new zone
  const [newBssid, setNewBssid] = useState("");
  const [newName, setNewName] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  const containerRef = useRef(null);

  // ── Load zones from Firebase ──────────────────────────────────
  useEffect(() => {
    const unsubZones = onValue(ref(db, "config/zones"), (snap) => {
      setZones(snap.val() || {});
    });
    const unsubRestricted = onValue(ref(db, "config/restrictedZones"), (snap) => {
      setRestrictedZones(snap.val() || {});
    });
    return () => { unsubZones(); unsubRestricted(); };
  }, []);

  // ── GSAP entry animation ──────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    gsap.fromTo(
      containerRef.current.querySelectorAll(".zs-animate"),
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }
    );
  }, []);

  // ── Add a new zone ────────────────────────────────────────────
  const addZone = () => {
    const bssid = newBssid.trim().toLowerCase();
    const name = newName.trim();
    if (!bssid || !name) {
      setSaveStatus("Please fill in both BSSID and zone name");
      return;
    }
    // Basic BSSID format check (xx:xx:xx:xx:xx:xx)
    if (!/^([0-9a-f]{2}:){5}[0-9a-f]{2}$/.test(bssid)) {
      setSaveStatus("Invalid BSSID format. Use format: aa:bb:cc:dd:ee:ff");
      return;
    }
    set(ref(db, `config/zones/${bssid.replace(/[.:]/g, "_")}`), { bssid, name })
      .then(() => {
        setNewBssid("");
        setNewName("");
        setSaveStatus(`✅ Zone "${name}" added!`);
        setTimeout(() => setSaveStatus(""), 3000);
      })
      .catch((e) => setSaveStatus(`❌ Error: ${e.message}`));
  };

  // ── Remove a zone ─────────────────────────────────────────────
  const removeZone = (key, zoneName) => {
    if (!window.confirm(`Remove zone "${zoneName}"?`)) return;
    remove(ref(db, `config/zones/${key}`));
    // Also remove from restricted if it was there
    remove(ref(db, `config/restrictedZones/${zoneName}`));
  };

  // ── Toggle restricted status ──────────────────────────────────
  const toggleRestricted = (zoneName) => {
    if (restrictedZones[zoneName]) {
      remove(ref(db, `config/restrictedZones/${zoneName}`));
    } else {
      set(ref(db, `config/restrictedZones/${zoneName}`), true);
    }
  };

  const zoneEntries = Object.entries(zones);

  return (
    <>
      <Navbar />
      <div id="bg-canvas" />
      <div className="dashboard-container" ref={containerRef}>

        {/* Header */}
        <div className="dashboard-header zs-animate">
          <div className="dashboard-title-block">
            <h2><span>Zone Settings</span></h2>
            <div className="dashboard-subtitle">Wi-Fi Zone & Restricted Area Configuration</div>
          </div>
          <a href="/dashboard" className="zs-back-link">← Back to Dashboard</a>
        </div>

        {/* Info banner */}
        <div className="zs-info-banner zs-animate">
          <div className="zs-info-icon">💡</div>
          <div className="zs-info-text">
            Changes here apply <strong>instantly</strong> to both the Android app and this website.
            No rebuilding required. Add Wi-Fi access point BSSIDs and mark zones as restricted.
          </div>
        </div>

        {/* Add new zone form */}
        <div className="zs-card zs-animate">
          <div className="zs-card-header">
            <h3>➕ Add New Zone</h3>
          </div>
          <div className="zs-form-grid">
            <div className="zs-form-group">
              <label className="zs-label">BSSID (MAC Address)</label>
              <input
                type="text"
                className="zs-input"
                placeholder="e.g. aa:bb:cc:dd:ee:ff"
                value={newBssid}
                onChange={(e) => setNewBssid(e.target.value)}
              />
              <span className="zs-hint">Wi-Fi access point MAC address</span>
            </div>
            <div className="zs-form-group">
              <label className="zs-label">Zone Name</label>
              <input
                type="text"
                className="zs-input"
                placeholder="e.g. Server Room"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <span className="zs-hint">Human-readable name for this zone</span>
            </div>
            <button className="zs-add-btn" onClick={addZone}>Add Zone</button>
          </div>
          {saveStatus && <div className="zs-status">{saveStatus}</div>}
        </div>

        {/* Zone list */}
        <div className="zs-card zs-animate">
          <div className="zs-card-header">
            <h3>📡 All Zones ({zoneEntries.length})</h3>
          </div>

          {zoneEntries.length === 0 ? (
            <div className="zs-empty">
              No zones configured yet. Add your first zone above.
            </div>
          ) : (
            <div className="zs-zone-list">
              <div className="zs-zone-header-row">
                <span className="zs-col-status">Status</span>
                <span className="zs-col-name">Zone Name</span>
                <span className="zs-col-bssid">BSSID</span>
                <span className="zs-col-restricted">Restricted</span>
                <span className="zs-col-action">Action</span>
              </div>
              {zoneEntries.map(([key, val]) => {
                const zoneName = typeof val === "string" ? val : val.name || key;
                const bssid = typeof val === "string" ? key.replace(/_/g, ":") : val.bssid || key.replace(/_/g, ":");
                const isRestricted = !!restrictedZones[zoneName];
                return (
                  <div key={key} className={`zs-zone-row ${isRestricted ? "zs-restricted" : ""}`}>
                    <span className="zs-col-status">
                      <span className={`zs-dot ${isRestricted ? "zs-dot-red" : "zs-dot-green"}`} />
                    </span>
                    <span className="zs-col-name">
                      <strong>{zoneName}</strong>
                    </span>
                    <span className="zs-col-bssid">
                      <code>{bssid}</code>
                    </span>
                    <span className="zs-col-restricted">
                      <button
                        className={`zs-toggle ${isRestricted ? "zs-toggle-on" : ""}`}
                        onClick={() => toggleRestricted(zoneName)}
                        title={isRestricted ? "Click to unrestrict" : "Click to restrict"}
                      >
                        <span className="zs-toggle-dot" />
                        <span className="zs-toggle-label">
                          {isRestricted ? "RESTRICTED" : "OPEN"}
                        </span>
                      </button>
                    </span>
                    <span className="zs-col-action">
                      <button
                        className="zs-remove-btn"
                        onClick={() => removeZone(key, zoneName)}
                      >
                        🗑️
                      </button>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Help text */}
        <div className="zs-help zs-animate">
          <h4>How to find a BSSID</h4>
          <ol>
            <li>Connect your phone to the Wi-Fi hotspot / access point</li>
            <li>Go to <strong>Settings → Wi-Fi → tap the connected network</strong></li>
            <li>Look for <strong>"MAC address"</strong> or <strong>"BSSID"</strong></li>
            <li>Or use a Wi-Fi analyzer app to scan nearby access points</li>
          </ol>
        </div>

      </div>
    </>
  );
}

export default ZoneSettings;
