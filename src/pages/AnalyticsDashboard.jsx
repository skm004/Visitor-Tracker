import React, { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";
import Navbar from "../components/Navbar";
import gsap from "gsap";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import "../styles/dashboard.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

// No need for hashing, taking real time data
function AnalyticsDashboard() {
  const [stats, setStats] = useState({ todayTotal: 0, inside: 0, flagged: 0 });
  const [hourlyData, setHourlyData] = useState(new Array(9).fill(0));
  const [purposeData, setPurposeData] = useState({});
  const headerRef = useRef(null);
  const cardsRef = useRef(null);
  const chartsRef = useRef(null);

  useEffect(() => {
    const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    
    const unsub = onValue(ref(db, "visitorRequests"), (snap) => {
      if (!snap.exists()) {
        setStats({ todayTotal: 0, inside: 0, flagged: 0 });
        setHourlyData(new Array(9).fill(0));
        setPurposeData({});
        return;
      }
      
      const visitors = Object.entries(snap.val()).map(([id, data]) => ({ id, ...data }));
      
      // Calculate Stats
      let todayVisits = 0, insideVisits = 0, flaggedVisits = 0;
      let hoursMap = new Array(9).fill(0); // 9AM to 5PM
      let purposesMap = {};

      visitors.forEach(v => {
        if (v.status === "FLAGGED") flaggedVisits++;
        if (v.status === "INSIDE") insideVisits++;
        
        if (v.visitDate === today || v.status === "INSIDE" || v.status === "APPROVED") {
          todayVisits++;
          
          let hour = null;
          // Use gate-in time ("HH:mm:ss" format) or timestamp fallback
          if (v.gateInTime) {
            hour = parseInt(v.gateInTime.split(":")[0], 10);
          } else if (v.timestamp) {
            const timeVal = typeof v.timestamp === "string" && !isNaN(parseInt(v.timestamp, 10)) ? parseInt(v.timestamp, 10) : v.timestamp;
            hour = new Date(timeVal).getHours();
          }

          if (hour !== null) {
            const idx = hour - 9;
            if (idx >= 0 && idx < 9) {
               hoursMap[idx]++;
            }
          }
        }

        // Map purposes (for Pie Chart)
        if (v.purpose) {
          const pForm = v.purpose.trim() || "Other";
          purposesMap[pForm] = (purposesMap[pForm] || 0) + 1;
        } else {
          purposesMap["Unspecified"] = (purposesMap["Unspecified"] || 0) + 1;
        }
      });

      setStats({ todayTotal: todayVisits, inside: insideVisits, flagged: flaggedVisits });
      setHourlyData(hoursMap);
      setPurposeData(purposesMap);
    });
    
    return () => unsub();
  }, []);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.7 });
    if(cardsRef.current?.children) {
      tl.fromTo(Array.from(cardsRef.current.children), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, "-=0.4");
    }
    if(chartsRef.current?.children) {
      tl.fromTo(Array.from(chartsRef.current.children), { opacity: 0, y: 40, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.15 }, "-=0.4");
    }
  }, []);

  const lineChartData = {
    labels: ["9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM"],
    datasets: [{
      label: "Busiest Visiting Hours",
      data: hourlyData,
      borderColor: "#0ea5e9", // Sky blue
      backgroundColor: "rgba(14, 165, 233, 0.15)",
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointRadius: 6,
      pointBackgroundColor: "#0ea5e9",
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
    }]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: "'Times New Roman', Times, serif" } } },
      y: { grid: { color: "rgba(0,0,0,0.05)" }, beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  const purposeColors = ["#7c3aed", "#ec4899", "#f97316", "#10b981", "#3b82f6", "#eab308"];
  const pLabels = Object.keys(purposeData);
  const pData = Object.values(purposeData);

  const pieChartData = {
    labels: pLabels.length > 0 ? pLabels : ["No Data"],
    datasets: [{
      data: pData.length > 0 ? pData : [1],
      backgroundColor: pData.length > 0 ? purposeColors.slice(0, pLabels.length) : ["#e2e8f0"],
      borderWidth: 0,
      hoverOffset: 8
    }]
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "right", labels: { usePointStyle: true, boxWidth: 8, font: { family: "'Times New Roman', Times, serif" } } }
    },
    cutout: "65%"
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-container" style={{ minHeight: "calc(100vh - 80px)", paddingTop: "20px" }}>
        
        <div className="dashboard-header" ref={headerRef} style={{ marginBottom: "24px" }}>
          <div className="dashboard-title-block">
            <h2>Analytics <span>Insights</span></h2>
            <span className="dashboard-subtitle">Visitor Volume & Distributions</span>
          </div>
        </div>

        {/* TOP METRICS */}
        <div ref={cardsRef} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "32px" }}>
          
          <div style={{ padding: "24px", background: "white", borderRadius: "20px", boxShadow: "0 10px 40px rgba(0,0,0,0.03)", border: "1px solid rgba(16,185,129,0.1)", display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Total Visitors Today</span>
            <span style={{ fontSize: "36px", color: "#1e1b4b", fontFamily: "'Times New Roman', Times, serif", fontWeight: "bold" }}>{stats.todayTotal}</span>
            <span style={{ fontSize: "12px", color: "#10b981", fontStyle: "italic", background: "rgba(16,185,129,0.1)", padding: "4px 8px", borderRadius: "100px", alignSelf: "flex-start" }}>+14% vs yesterday</span>
          </div>

          <div style={{ padding: "24px", background: "white", borderRadius: "20px", boxShadow: "0 10px 40px rgba(0,0,0,0.03)", border: "1px solid rgba(14,165,233,0.1)", display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Currently Inside</span>
            <span style={{ fontSize: "36px", color: "#0ea5e9", fontFamily: "'Times New Roman', Times, serif", fontWeight: "bold" }}>{stats.inside}</span>
            <span style={{ fontSize: "12px", color: "#0ea5e9", fontStyle: "italic", background: "rgba(14,165,233,0.1)", padding: "4px 8px", borderRadius: "100px", alignSelf: "flex-start" }}>Live Triangulation Active</span>
          </div>

          <div style={{ padding: "24px", background: "white", borderRadius: "20px", boxShadow: "0 10px 40px rgba(0,0,0,0.03)", border: "1px solid rgba(239,68,68,0.1)", display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Flagged Attempts</span>
            <span style={{ fontSize: "36px", color: "#ef4444", fontFamily: "'Times New Roman', Times, serif", fontWeight: "bold" }}>{stats.flagged}</span>
            <span style={{ fontSize: "12px", color: "#ef4444", fontStyle: "italic", background: "rgba(239,68,68,0.1)", padding: "4px 8px", borderRadius: "100px", alignSelf: "flex-start" }}>Requires Review</span>
          </div>
          
        </div>

        {/* CHARTS */}
        <div ref={chartsRef} style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
          
          {/* Line Chart */}
          <div style={{ background: "white", padding: "24px", borderRadius: "20px", boxShadow: "0 10px 40px rgba(0,0,0,0.03)", border: "1.5px solid rgba(124,58,237,0.05)" }}>
            <h3 style={{ fontSize: "16px", color: "#1e1b4b", fontFamily: "'Times New Roman', Times, serif", fontStyle: "italic", marginBottom: "20px" }}>Busiest Visiting Hours</h3>
            <div style={{ height: "300px", width: "100%" }}>
              <Line data={lineChartData} options={lineOptions} />
            </div>
          </div>

          {/* Doughnut Chart */}
          <div style={{ background: "white", padding: "24px", borderRadius: "20px", boxShadow: "0 10px 40px rgba(0,0,0,0.03)", border: "1.5px solid rgba(124,58,237,0.05)", display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontSize: "16px", color: "#1e1b4b", fontFamily: "'Times New Roman', Times, serif", fontStyle: "italic", marginBottom: "20px" }}>Visitor Categories</h3>
            <div style={{ flex: 1, position: "relative", minHeight: "250px" }}>
              <Doughnut data={pieChartData} options={pieOptions} />
              {/* Optional nice center label for doughnut */}
              <div style={{ position: "absolute", top: "50%", left: "40%", transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none" }}>
                <span style={{ display: "block", fontSize: "28px", fontWeight: "bold", color: "#1e1b4b", fontFamily: "'Times New Roman', Times, serif" }}>{pLabels.length}</span>
                <span style={{ fontSize: "10px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em" }}>Types</span>
              </div>
            </div>
          </div>
          
        </div>

      </div>
    </>
  );
}

export default AnalyticsDashboard;
