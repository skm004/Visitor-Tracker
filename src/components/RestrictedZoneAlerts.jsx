import { useEffect, useRef, useState, useCallback } from "react";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";
import gsap from "gsap";

// How often the alarm beeps (ms) while a visitor is in a restricted zone
const BEEP_INTERVAL_MS = 3000;

function RestrictedZoneAlerts() {
  // Each alert: { id, visitorName, zone, timestamp, requestId }
  const [alerts, setAlerts] = useState([]);
  // Restricted zones loaded from Firebase (replaces hardcoded list)
  const [restrictedZones, setRestrictedZones] = useState([]);
  const restrictedRef = useRef([]);
  const containerRef = useRef(null);

  // Continuous alarm refs
  const audioCtxRef = useRef(null);
  const beepIntervalRef = useRef(null);
  // Track mute state — admin can silence the alarm manually
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false);

  // Keep isMutedRef in sync with state
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // ── Play a single beep ─────────────────────────────────────────
  const playBeep = useCallback(() => {
    if (isMutedRef.current) return;
    try {
      // Reuse or create AudioContext
      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);

      // Second higher-pitched beep after short pause (alarm feel)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "square";
      osc2.frequency.setValueAtTime(1100, ctx.currentTime + 0.45);
      gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.45);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.85);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.45);
      osc2.stop(ctx.currentTime + 0.85);
    } catch (_) {
      // AudioContext may not be available
    }
  }, []);

  // ── Start/stop continuous beeping based on active alerts ──────
  useEffect(() => {
    // Always clear any existing interval first to prevent duplicates
    if (beepIntervalRef.current) {
      clearInterval(beepIntervalRef.current);
      beepIntervalRef.current = null;
    }

    if (alerts.length > 0 && !isMuted) {
      playBeep(); // immediate first beep
      beepIntervalRef.current = setInterval(playBeep, BEEP_INTERVAL_MS);
    } else {
      // No alerts or muted — close AudioContext to fully stop sound
      if (alerts.length === 0 && audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch (_) {}
        audioCtxRef.current = null;
      }
    }

    return () => {
      if (beepIntervalRef.current) {
        clearInterval(beepIntervalRef.current);
        beepIntervalRef.current = null;
      }
    };
  }, [alerts.length, isMuted, playBeep]);

  // ── Load restricted zones from Firebase ────────────────────────
  useEffect(() => {
    const unsub = onValue(ref(db, "config/restrictedZones"), (snap) => {
      const data = snap.val() || {};
      const names = Object.keys(data);
      setRestrictedZones(names);
      restrictedRef.current = names;
    });
    return () => unsub();
  }, []);

  // ── Firebase listener — detect AND auto-clear restricted zone alerts ──
  useEffect(() => {
    const unsub = onValue(ref(db, "visitorRequests"), (snap) => {
      if (!snap.exists()) {
        setAlerts([]);
        return;
      }
      const data = snap.val();
      const now = Date.now();
      const currentRestricted = restrictedRef.current;

      // Build set of currently active violations: reqId::zone
      const activeViolations = new Map();

      Object.entries(data).forEach(([reqId, v]) => {
        if (!v || v.status !== "INSIDE") return;
        const zone = v.currentZone;
        if (!zone || !currentRestricted.includes(zone)) return;

        const alertKey = `${reqId}::${zone}`;
        activeViolations.set(alertKey, {
          visitorName: v.name || "Unknown Visitor",
          zone,
          requestId: reqId,
        });
      });

      setAlerts((prev) => {
        // Keep existing alerts that are still active (preserve timestamp)
        const existingKeys = new Set(prev.map((a) => `${a.requestId}::${a.zone}`));
        const kept = prev.filter((a) => activeViolations.has(`${a.requestId}::${a.zone}`));

        // Add new alerts for violations we haven't seen
        const newAlerts = [];
        for (const [key, info] of activeViolations) {
          if (!existingKeys.has(key)) {
            newAlerts.push({
              id: `${key}::${now}`,
              visitorName: info.visitorName,
              zone: info.zone,
              timestamp: now,
              requestId: info.requestId,
            });
          }
        }

        return [...newAlerts, ...kept];
      });
    });

    return () => unsub();
  }, []);

  // ── GSAP animate new alerts in ──────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    const items = containerRef.current.querySelectorAll(
      ".rz-alert-item:not(.rz-animated)"
    );
    if (items.length) {
      gsap.fromTo(
        items,
        { opacity: 0, x: 60, scale: 0.95 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: "back.out(1.4)",
          onComplete: () =>
            items.forEach((el) => el.classList.add("rz-animated")),
        }
      );
    }
  }, [alerts]);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  if (alerts.length === 0) return null;

  return (
    <div className="rz-alerts-container" ref={containerRef}>
      {/* Header */}
      <div className="rz-alerts-header">
        <div className="rz-alerts-title">
          <span className="rz-alerts-icon">🚨</span>
          <span>Restricted Zone Alerts</span>
          <span className="rz-alerts-count">{alerts.length}</span>
        </div>
        <button
          className={`rz-mute-btn ${isMuted ? "rz-muted" : ""}`}
          onClick={toggleMute}
          title={isMuted ? "Unmute Alarm" : "Mute Alarm"}
        >
          {isMuted ? "🔇 Muted" : "🔊 Alarm On"}
        </button>
      </div>

      {/* Alert list */}
      <div className="rz-alerts-list">
        {alerts.map((alert) => {
          const timeAgo = Math.round(
            (Date.now() - alert.timestamp) / 1000
          );
          const timeLabel =
            timeAgo < 60
              ? `${timeAgo}s ago`
              : `${Math.round(timeAgo / 60)}m ago`;

          return (
            <div
              key={alert.id}
              id={`rz-${alert.id}`}
              className="rz-alert-item"
            >
              <div className="rz-alert-pulse" />
              <div className="rz-alert-content">
                <div className="rz-alert-message">
                  <strong>{alert.visitorName}</strong> is in restricted
                  zone: <span className="rz-zone-name">{alert.zone}</span>
                </div>
                <div className="rz-alert-time">Detected {timeLabel} · Still active</div>
              </div>
              <div className="rz-alert-live-badge">LIVE</div>
            </div>
          );
        })}
      </div>

      <div className="rz-alerts-footer">
        ⚠️ Alerts will automatically clear when visitors leave restricted zones
      </div>
    </div>
  );
}

export default RestrictedZoneAlerts;
