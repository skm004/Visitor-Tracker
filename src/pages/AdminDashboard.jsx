import { useEffect, useRef, useState } from "react";
import { db } from "../firebase";
import { ref, onValue, update } from "firebase/database";
import gsap from "gsap";
import Navbar from "../components/Navbar";
import DashboardCard from "../components/DashboardCard";
import StatCard from "../components/StatCard";
import VisitorTrendChart from "../components/VisitorTrendChart";
import ZoneWidget from "../components/ZoneWidget";
import "../styles/dashboard.css";

const BACKEND_URL = "http://localhost:5000";

function useBgCanvas() {
  useEffect(() => {
    const canvas = document.getElementById("bg-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    window.addEventListener("resize", () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; });
    const orbs = [
      { x:W*0.08,y:H*0.18,r:420,tx:W*0.08,ty:H*0.18,color:[129,140,248],alpha:0.22 },
      { x:W*0.88,y:H*0.22,r:380,tx:W*0.88,ty:H*0.22,color:[168,85,247], alpha:0.20 },
      { x:W*0.70,y:H*0.80,r:360,tx:W*0.70,ty:H*0.80,color:[236,72,153], alpha:0.16 },
      { x:W*0.05,y:H*0.78,r:300,tx:W*0.05,ty:H*0.78,color:[56,189,248], alpha:0.18 },
      { x:W*0.50,y:H*0.50,r:260,tx:W*0.50,ty:H*0.50,color:[167,139,250],alpha:0.14 },
    ];
    orbs.forEach((b,i)=>{
      const drift=()=>gsap.to(b,{tx:(0.1+Math.random()*0.8)*W,ty:(0.1+Math.random()*0.8)*H,duration:8+Math.random()*8,ease:"sine.inOut",onComplete:drift});
      gsap.delayedCall(i*1.2,drift);
      const pulse=()=>gsap.to(b,{r:b.r*(0.7+Math.random()*0.6),duration:5+Math.random()*5,ease:"sine.inOut",onComplete:pulse});
      gsap.delayedCall(i*0.7,pulse);
    });
    const bubbles=Array.from({length:18},()=>({x:Math.random()*W,y:H+Math.random()*200,r:3+Math.random()*12,wobble:Math.random()*Math.PI*2,wobbleSpeed:0.01+Math.random()*0.02,alpha:0.1+Math.random()*0.25,color:[[129,140,248],[168,85,247],[56,189,248],[167,139,250],[236,72,153]][Math.floor(Math.random()*5)]}));
    bubbles.forEach(bub=>{const floatUp=()=>{bub.y=H+20;bub.x=Math.random()*W;gsap.to(bub,{y:-50,duration:8+Math.random()*10,ease:"none",onComplete:floatUp});};gsap.delayedCall(Math.random()*12,floatUp);});
    const beams=[{x:W*0.15,angle:0.4,width:120,length:H*0.6,alpha:0,color:[129,140,248]},{x:W*0.85,angle:-0.4,width:100,length:H*0.5,alpha:0,color:[236,72,153]}];
    beams.forEach((beam,i)=>{const shimmer=()=>gsap.to(beam,{alpha:0.04+Math.random()*0.05,duration:3+Math.random()*4,ease:"sine.inOut",yoyo:true,repeat:1,onComplete:shimmer});gsap.delayedCall(i*2,shimmer);});
    let raf;
    function draw(){
      ctx.clearRect(0,0,W,H);
      const isDark = document.body.classList.contains("obsidian-mode");
      const bgGrad=ctx.createLinearGradient(0,0,W,H);
      if (isDark) {
        bgGrad.addColorStop(0,"#020617");bgGrad.addColorStop(0.5,"#0f172a");bgGrad.addColorStop(1,"#1e293b");
      } else {
        bgGrad.addColorStop(0,"#f8fafc");bgGrad.addColorStop(0.5,"#e2e8f0");bgGrad.addColorStop(1,"#cbd5e1");
      }
      ctx.fillStyle=bgGrad;ctx.fillRect(0,0,W,H);
      orbs.forEach(b=>{b.x+=(b.tx-b.x)*0.006;b.y+=(b.ty-b.y)*0.006;const g=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r);const[r,g2,bl]=b.color;g.addColorStop(0,`rgba(${r},${g2},${bl},${b.alpha})`);g.addColorStop(0.45,`rgba(${r},${g2},${bl},${b.alpha*0.35})`);g.addColorStop(1,`rgba(${r},${g2},${bl},0)`);ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();});
      beams.forEach(beam=>{if(beam.alpha<=0.002)return;ctx.save();ctx.translate(beam.x,0);ctx.rotate(beam.angle);const bg=ctx.createLinearGradient(0,0,0,beam.length);const[r,g,bl]=beam.color;bg.addColorStop(0,`rgba(${r},${g},${bl},${beam.alpha})`);bg.addColorStop(1,`rgba(${r},${g},${bl},0)`);ctx.fillStyle=bg;ctx.fillRect(-beam.width/2,0,beam.width,beam.length);ctx.restore();});
      bubbles.forEach(bub=>{bub.wobble+=bub.wobbleSpeed;const wx=bub.x+Math.sin(bub.wobble)*18;const[r,g,bl]=bub.color;const bg=ctx.createRadialGradient(wx,bub.y,0,wx,bub.y,bub.r*2);bg.addColorStop(0,`rgba(${r},${g},${bl},${bub.alpha*0.3})`);bg.addColorStop(1,`rgba(${r},${g},${bl},0)`);ctx.beginPath();ctx.arc(wx,bub.y,bub.r*2,0,Math.PI*2);ctx.fillStyle=bg;ctx.fill();ctx.beginPath();ctx.arc(wx,bub.y,bub.r,0,Math.PI*2);ctx.fillStyle=`rgba(${r},${g},${bl},${bub.alpha})`;ctx.fill();ctx.beginPath();ctx.arc(wx-bub.r*0.28,bub.y-bub.r*0.28,bub.r*0.32,0,Math.PI*2);ctx.fillStyle="rgba(255,255,255,0.5)";ctx.fill();});
      raf=requestAnimationFrame(draw);
    }
    draw();
    return ()=>cancelAnimationFrame(raf);
  },[]);
}

// ─────────────────────────────────────────────────────────────────────
// QR SCANNER — date validation helper
//
// New QR format: "uid|requestId|visitDate"  e.g. "abc|xyz|07 Mar 2026"
// Old QR format: "uid|requestId"            (backward compatible)
//
// Returns: { valid: true, uid, requestId }
//       or { valid: false, error: "..." }
// ─────────────────────────────────────────────────────────────────────
function parseQrData(raw, today) {
  const parts = raw.trim().split("|");

  if (parts.length === 3) {
    const [uid, requestId, qrDate] = parts;
    if (!uid || !requestId || !qrDate) return { valid: false, error: "Invalid QR code." };
    if (qrDate !== today) {
      return { valid: false, error: `QR is not valid for today. It is valid on ${qrDate}.` };
    }
    return { valid: true, uid, requestId };
  }

  if (parts.length === 2) {
    // Old QR without date — allow through without date check
    const [uid, requestId] = parts;
    if (!uid || !requestId) return { valid: false, error: "Invalid QR code." };
    return { valid: true, uid, requestId };
  }

  return { valid: false, error: "Invalid QR code format." };
}

function GatePortalWidget() {
  const [visitors,  setVisitors]  = useState([]);
  const [actionMsg, setActionMsg] = useState(null);

  // NEW: QR scanner state
  const [qrInput,   setQrInput]   = useState("");
  const [qrError,   setQrError]   = useState("");
  const [qrSuccess, setQrSuccess] = useState("");
  const [scanning,  setScanning]  = useState(false);

  const tableRef = useRef(null);
  const msgRef   = useRef(null);

  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  useEffect(() => {
    const unsub = onValue(ref(db, "visitorRequests"), snap => {
      if (!snap.exists()) { setVisitors([]); return; }
      const data = snap.val();
      setVisitors(
        Object.keys(data)
          .map(key => ({ id: key, ...data[key] }))
          .filter(v => v.visitDate === today && (v.status === "APPROVED" || v.status === "INSIDE"))
      );
    });
    return () => unsub();
  }, [today]);

  useEffect(() => {
    if (!tableRef.current) return;
    const rows = tableRef.current.querySelectorAll("tbody tr");
    if (rows.length) gsap.fromTo(rows, { opacity:0, x:-12 }, { opacity:1, x:0, duration:0.4, stagger:0.07, ease:"power2.out" });
  }, [visitors]);

  const flash = (text, color) => {
    setActionMsg({ text, color });
    setTimeout(() => {
      if (msgRef.current) gsap.to(msgRef.current, { opacity:0, y:-6, duration:0.3, onComplete:() => setActionMsg(null) });
    }, 2500);
    if (msgRef.current) gsap.fromTo(msgRef.current, { opacity:0, y:-6 }, { opacity:1, y:0, duration:0.3 });
  };

  const checkIn = async (v) => {
    try {
      await fetch(`${BACKEND_URL}/checkin`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ name:v.name }) });
      await update(ref(db, `visitorRequests/${v.id}`), { status:"INSIDE" });
      flash(`✓  ${v.name} checked in successfully`, "#059669");
    } catch (err) { console.error(err); }
  };

  const checkOut = async (v) => {
    try {
      await fetch(`${BACKEND_URL}/checkout`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ name:v.name }) });
      await update(ref(db, `visitorRequests/${v.id}`), { status:"EXITED" });
      flash(`✕  ${v.name} checked out`, "#dc2626");
    } catch (err) { console.error(err); }
  };

  // NEW: Handle QR scan — validates date, finds visitor, checks them in
  const handleQrScan = async () => {
    setQrError("");
    setQrSuccess("");
    if (!qrInput.trim()) { setQrError("Please enter or scan a QR code."); return; }

    const result = parseQrData(qrInput, today);
    if (!result.valid) {
      setQrError(result.error);
      setQrInput("");
      return;
    }

    const visitor = visitors.find(v => v.id === result.requestId);
    if (!visitor) {
      setQrError("Visitor not found in today's approved list.");
      setQrInput("");
      return;
    }
    if (visitor.status === "INSIDE") {
      setQrError(`${visitor.name} is already checked in.`);
      setQrInput("");
      return;
    }

    setScanning(true);
    try {
      await fetch(`${BACKEND_URL}/checkin`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ name:visitor.name }) });
      await update(ref(db, `visitorRequests/${result.requestId}`), { status:"INSIDE" });
      setQrSuccess(`✓ ${visitor.name} checked in via QR`);
      flash(`✓  ${visitor.name} checked in via QR scan`, "#059669");
    } catch (err) {
      setQrError("Check-in failed. Please try again.");
    } finally {
      setScanning(false);
      setQrInput("");
    }
  };

  const insideCount   = visitors.filter(v => v.status === "INSIDE").length;
  const approvedCount = visitors.filter(v => v.status === "APPROVED").length;

  return (
    <div className="table-card">

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"20px",paddingBottom:"16px",borderBottom:"1.5px solid rgba(124,58,237,0.08)"}}>
        <div>
          <h3 style={{fontFamily:"'Times New Roman',Times,serif",fontSize:"16px",fontWeight:700,fontStyle:"italic",color:"#1e1b4b",marginBottom:"4px"}}>Gate Portal — Today</h3>
          <p style={{fontSize:"11px",color:"#9ca3af",fontStyle:"italic"}}>{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</p>
        </div>
        <div style={{display:"flex",gap:"10px",alignItems:"center",flexWrap:"wrap"}}>
          {approvedCount > 0 && (
            <span style={{fontSize:"11px",fontStyle:"italic",fontWeight:700,padding:"5px 14px",borderRadius:"100px",background:"rgba(59,130,246,0.10)",color:"#2563eb",border:"1px solid rgba(59,130,246,0.22)"}}>⏳ {approvedCount} awaiting</span>
          )}
          <span style={{fontSize:"11px",fontStyle:"italic",fontWeight:700,padding:"5px 14px",borderRadius:"100px",background:"rgba(16,185,129,0.10)",color:"#059669",border:"1px solid rgba(16,185,129,0.22)"}}>● {insideCount} inside</span>
        </div>
      </div>

      {/* Flash message */}
      {actionMsg && (
        <div ref={msgRef} style={{marginBottom:"14px",padding:"11px 18px",borderRadius:"12px",fontSize:"13px",fontStyle:"italic",fontWeight:700,background:`${actionMsg.color}0f`,color:actionMsg.color,border:`1px solid ${actionMsg.color}28`,opacity:0,fontFamily:"'Times New Roman',Times,serif"}}>
          {actionMsg.text}
        </div>
      )}

      {/* ── NEW: QR Scanner ──────────────────────────────────────────
          In production: plug in a USB QR/barcode scanner — it acts
          as a keyboard and auto-fires onKeyDown Enter when scanned.
          The date check happens inside parseQrData() above.
      ─────────────────────────────────────────────────────────────── */}
      <div style={{marginBottom:"20px",padding:"16px",borderRadius:"14px",background:"rgba(124,58,237,0.04)",border:"1.5px solid rgba(124,58,237,0.12)"}}>
        <p style={{fontSize:"11px",fontStyle:"italic",fontWeight:700,color:"#7c3aed",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"10px"}}>
          📷 QR Check-In Scanner
        </p>
        <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
          <input
            type="text"
            value={qrInput}
            onChange={e => { setQrInput(e.target.value); setQrError(""); setQrSuccess(""); }}
            onKeyDown={e => { if (e.key === "Enter") handleQrScan(); }}
            placeholder="Scan or paste QR code here…"
            style={{flex:1,padding:"9px 14px",borderRadius:"9px",border:"1.5px solid rgba(124,58,237,0.25)",fontFamily:"'Times New Roman',Times,serif",fontStyle:"italic",fontSize:"13px",color:"#1e1b4b",outline:"none",background:"#fff"}}
          />
          <button
            onClick={handleQrScan}
            disabled={scanning}
            style={{padding:"9px 18px",borderRadius:"9px",background:"linear-gradient(135deg,#818cf8,#a78bfa)",color:"#fff",border:"none",fontFamily:"'Times New Roman',Times,serif",fontStyle:"italic",fontWeight:700,fontSize:"13px",cursor:scanning?"not-allowed":"pointer",opacity:scanning?0.7:1,whiteSpace:"nowrap"}}
          >
            {scanning ? "Checking in…" : "✓ Check In"}
          </button>
        </div>

        {qrError && (
          <div style={{marginTop:"10px",padding:"9px 14px",borderRadius:"8px",background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.22)",color:"#dc2626",fontSize:"12px",fontStyle:"italic",fontWeight:600}}>
            ✗ {qrError}
          </div>
        )}
        {qrSuccess && (
          <div style={{marginTop:"10px",padding:"9px 14px",borderRadius:"8px",background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.22)",color:"#059669",fontSize:"12px",fontStyle:"italic",fontWeight:600}}>
            {qrSuccess}
          </div>
        )}
        <p style={{marginTop:"8px",fontSize:"10px",color:"#9ca3af",fontStyle:"italic"}}>
          Tip: A USB QR scanner acts as a keyboard and auto-submits on scan.
        </p>
      </div>

      {/* Visitors Table */}
      <div style={{overflowX:"auto"}}>
        <table className="visitor-table" ref={tableRef}>
          <thead>
            <tr><th>#</th><th>Name</th><th>Phone</th><th>Purpose</th><th>Person to Meet</th><th>Status</th><th style={{textAlign:"center"}}>Action</th></tr>
          </thead>
          <tbody>
            {visitors.length === 0
              ? <tr><td colSpan="7" style={{textAlign:"center",padding:"44px",color:"#9ca3af",fontStyle:"italic"}}>No approved visitors scheduled for today</td></tr>
              : visitors.map((v, i) => (
                <tr key={v.id}>
                  <td style={{color:"#9ca3af"}}>{i+1}</td>
                  <td style={{fontWeight:700,color:"#1e1b4b"}}>{v.name}</td>
                  <td>{v.phone}</td>
                  <td style={{maxWidth:"150px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.purpose||"—"}</td>
                  <td>{v.personToMeet||"—"}</td>
                  <td>
                    <span style={{padding:"3px 11px",borderRadius:"100px",fontSize:"11px",fontWeight:700,fontStyle:"italic",background:v.status==="INSIDE"?"rgba(16,185,129,0.12)":"rgba(59,130,246,0.10)",color:v.status==="INSIDE"?"#059669":"#2563eb",border:v.status==="INSIDE"?"1px solid rgba(16,185,129,0.25)":"1px solid rgba(59,130,246,0.22)"}}>
                      {v.status}
                    </span>
                  </td>
                  <td style={{textAlign:"center"}}>
                    {v.status === "APPROVED"
                      ? <button className="approve-btn" onClick={() => checkIn(v)}  style={{minWidth:"96px"}}>✓ Check-In</button>
                      : <button className="reject-btn"  onClick={() => checkOut(v)} style={{minWidth:"96px"}}>✕ Check-Out</button>
                    }
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [stats,setStats]=useState({pending:0,inside:0,todayTotal:0,activeZones:0,approved:0,rejected:0,allTime:0,flagged:0});
  const today=new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
  const todayDisplay=new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});

  useEffect(()=>{
    const unsub=onValue(ref(db,"visitorRequests"),snap=>{
      if(!snap.exists()){setStats({pending:0,inside:0,todayTotal:0,activeZones:0,approved:0,rejected:0,allTime:0,flagged:0});return;}
      const visitors=Object.values(snap.val()).filter(Boolean);
      const pending   =visitors.filter(v=>v.status==="PENDING").length;
      const inside    =visitors.filter(v=>v.status==="INSIDE").length;
      const approved  =visitors.filter(v=>v.status==="APPROVED"||v.status==="INSIDE").length;
      const rejected  =visitors.filter(v=>v.status==="REJECTED").length;
      const flagged   =visitors.filter(v=>v.status==="FLAGGED").length;
      const todayTotal=visitors.filter(v=>v.visitDate===today).length;
      const allTime   =visitors.length;
      const activeZones=new Set(visitors.filter(v=>v.status==="INSIDE"&&v.currentZone&&v.currentZone!=="Unknown Zone").map(v=>v.currentZone)).size;
      setStats({pending,inside,todayTotal,activeZones,approved,rejected,allTime,flagged});
    });
    return()=>unsub();
  },[today]);

  useEffect(()=>{
    [{sel:".stat-card:nth-child(1) .stat-value",val:stats.pending},{sel:".stat-card:nth-child(2) .stat-value",val:stats.inside},{sel:".stat-card:nth-child(3) .stat-value",val:stats.todayTotal},{sel:".stat-card:nth-child(4) .stat-value",val:stats.activeZones}].forEach(({sel,val})=>{const el=document.querySelector(sel);if(!el)return;const cur=parseInt(el.textContent,10)||0;if(cur===val)return;gsap.fromTo(el,{textContent:cur},{textContent:val,duration:1.0,ease:"power2.out",snap:{textContent:1},onUpdate(){el.textContent=Math.round(parseFloat(el.textContent));}});});
  },[stats]);

  useEffect(()=>{
    const gctx=gsap.context(()=>{
      const tl=gsap.timeline({defaults:{ease:"power3.out"}});
      tl.fromTo(".dashboard-header",{opacity:0,y:-24},{opacity:1,y:0,duration:0.7});
      tl.fromTo(".stat-card",{opacity:0,y:40,scale:0.92},{opacity:1,y:0,scale:1,duration:0.6,stagger:0.1},"-=0.3");
      tl.fromTo(".extra-stat-card",{opacity:0,y:20},{opacity:1,y:0,duration:0.5,stagger:0.09},"-=0.4");
      tl.fromTo(".dashboard-card",{opacity:0,y:30,rotateX:8},{opacity:1,y:0,rotateX:0,duration:0.55,stagger:0.12,transformPerspective:900,transformOrigin:"top center"},"-=0.4");
      tl.fromTo(".widget-card",{opacity:0,y:30},{opacity:1,y:0,duration:0.65,stagger:0.15},"-=0.35");
      tl.fromTo(".table-card",{opacity:0,y:30},{opacity:1,y:0,duration:0.65},"-=0.3");
    });
    return()=>gctx.revert();
  },[]);

  useEffect(()=>{
    const cards=document.querySelectorAll(".dashboard-card");const fns=[];
    cards.forEach(card=>{
      const move=e=>{const r=card.getBoundingClientRect();const x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;gsap.to(card,{x:x*0.04,y:y*0.04,rotateX:(-y/r.height)*4,rotateY:(x/r.width)*4,duration:0.4,ease:"power2.out",transformPerspective:900});};
      const leave=()=>gsap.to(card,{x:0,y:0,rotateX:0,rotateY:0,duration:0.5,ease:"elastic.out(1,0.5)"});
      card.addEventListener("mousemove",move);card.addEventListener("mouseleave",leave);
      fns.push(()=>{card.removeEventListener("mousemove",move);card.removeEventListener("mouseleave",leave);});
    });
    return()=>fns.forEach(f=>f());
  },[]);

  useBgCanvas();

  const total=stats.approved+stats.rejected+stats.pending;
  const approvalRate =total>0?Math.round((stats.approved/total)*100):0;
  const rejectionRate=total>0?Math.round((stats.rejected/total)*100):0;

  const extraStats=[
    {label:"Approved Total",value:stats.approved,color:"#10b981",bar:approvalRate},
    {label:"Rejected Total",value:stats.rejected,color:"#ef4444",bar:rejectionRate},
    {label:"All-Time Total",value:stats.allTime,  color:"#7c3aed",bar:Math.min(100,stats.allTime*5)},
    {label:"Flagged",       value:stats.flagged,  color:"#f97316",bar:Math.min(100,stats.flagged*20)},
  ];

  return(
    <>
      <Navbar/>
      <canvas id="bg-canvas"/>
      <div className="dashboard-container">

        <div className="dashboard-header">
          <div className="dashboard-title-block">
            <h2><span>Admin</span> Dashboard</h2>
            <span className="dashboard-subtitle">VisitorTrack · Command Centre</span>
          </div>
          <span className="dashboard-date">{todayDisplay}</span>
        </div>

        {stats.flagged > 0 && (
          <div style={{marginBottom:"24px",padding:"14px 20px",borderRadius:"14px",background:"rgba(249,115,22,0.08)",border:"1.5px solid rgba(249,115,22,0.25)",display:"flex",alignItems:"center",gap:"12px",fontSize:"13px",color:"#c2410c",fontWeight:600}}>
            <span style={{fontSize:"20px"}}>🚩</span>
            <span>
              {stats.flagged} flagged request{stats.flagged>1?"s":""} need{stats.flagged===1?"s":""} your review.{" "}
              <a href="/approvals" style={{color:"#ea580c",textDecoration:"underline"}}>Review now →</a>
            </span>
          </div>
        )}

        <div className="section-label">Overview</div>
        <div className="stats-grid">
          <StatCard title="Pending Approvals"  value={stats.pending}     accent="violet" icon="⏳"/>
          <StatCard title="Visitors Inside"    value={stats.inside}      accent="sky"    icon="🟢"/>
          <StatCard title="Today's Visitors"   value={stats.todayTotal}  accent="mint"   icon="👥"/>
          <StatCard title="Active Wi-Fi Zones" value={stats.activeZones} accent="peach"  icon="📡"/>
        </div>

        <div className="section-label">Statistics</div>
        <div className="extra-stats-grid">
          {extraStats.map(s=>(
            <div className="extra-stat-card" key={s.label}>
              <div className="extra-stat-dot" style={{background:s.color,boxShadow:`0 0 10px ${s.color}60`}}/>
              <div className="extra-stat-info">
                <span className="extra-stat-label">{s.label}</span>
                <span className="extra-stat-value" style={{color:s.color}}>{s.value}</span>
                <div className="extra-stat-bar-track">
                  <div className="extra-stat-bar-fill" style={{width:`${s.bar}%`,background:`linear-gradient(90deg,${s.color}88,${s.color})`,boxShadow:`0 0 6px ${s.color}40`}}/>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="section-label">Modules</div>
        <div className="card-grid">
          <DashboardCard title="Approval Requests" description="Approve or reject visitor entry requests" link="/approvals" tag="Action Required"/>
          <DashboardCard title="Visitors Inside"   description="Track visitors using Wi-Fi RSSI triangulation" link="/visitors-inside" tag="Live Tracking"/>
          <DashboardCard title="Visitor Records"   description="Past and upcoming approved visits" link="/history" tag="Analytics"/>
        </div>

        <div className="section-label">Live Data</div>
        <div className="widgets-grid">
          <VisitorTrendChart/>
          <ZoneWidget/>
        </div>

        <div className="section-label" style={{marginTop:"32px"}}>Gate Portal</div>
        <GatePortalWidget/>

      </div>
    </>
  );
}

export default AdminDashboard;