import { useEffect, useRef, useState } from "react";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";
import gsap from "gsap";

const ZONE_COLORS = ["#7c3aed","#0ea5e9","#10b981","#f97316","#ec4899","#6366f1"];
const ZONE_BGS    = ["rgba(124,58,237,0.08)","rgba(14,165,233,0.08)","rgba(16,185,129,0.08)",
                     "rgba(249,115,22,0.08)","rgba(236,72,153,0.08)","rgba(99,102,241,0.08)"];

function ZoneWidget() {
  const [zoneCounts, setZoneCounts] = useState({});
  const wrapperRef=useRef(null), listRef=useRef(null);

  useEffect(()=>{
    const unsub=onValue(ref(db,"visitorRequests"),snap=>{
      if(!snap.exists()){setZoneCounts({});return;}
      const counts={};
      Object.values(snap.val()).forEach(v=>{
        if(v?.status==="INSIDE"&&v.currentZone) counts[v.currentZone]=(counts[v.currentZone]||0)+1;
      });
      setZoneCounts(counts);
    });
    return()=>unsub();
  },[]);

  useEffect(()=>{
    if(wrapperRef.current) gsap.fromTo(wrapperRef.current,{opacity:0,y:30},{opacity:1,y:0,duration:0.7,ease:"power3.out",delay:0.3});
  },[]);

  useEffect(()=>{
    if(!listRef.current) return;
    const rows=listRef.current.querySelectorAll(".zone-row");
    if(rows.length) gsap.fromTo(rows,{opacity:0,x:-16},{opacity:1,x:0,duration:0.45,stagger:0.09,ease:"power2.out",delay:0.1});
    listRef.current.querySelectorAll(".zone-bar-fill").forEach(bar=>
      gsap.fromTo(bar,{width:"0%"},{width:bar.dataset.width,duration:0.9,ease:"power3.out",delay:0.3})
    );
  },[zoneCounts]);

  const entries=Object.entries(zoneCounts);
  const hasZones=entries.length>0;
  const maxCount=hasZones?Math.max(...entries.map(([,c])=>c)):1;
  const totalInside=entries.reduce((a,[,c])=>a+c,0);

  return (
    <div className="widget-card" ref={wrapperRef} style={{opacity:0}}>
      <div className="widget-header">
        <h3>Visitors by Zone</h3>
        {hasZones&&<span className="widget-badge">{totalInside} inside</span>}
      </div>

      <ul ref={listRef} style={{listStyle:"none",padding:0,margin:0,display:"flex",flexDirection:"column",gap:"8px"}}>
        {hasZones ? (
          entries.sort(([,a],[,b])=>b-a).map(([zone,count],i)=>{
            const color=ZONE_COLORS[i%ZONE_COLORS.length];
            const bg   =ZONE_BGS[i%ZONE_BGS.length];
            const widthPct=`${Math.round((count/maxCount)*100)}%`;
            return (
              <li key={zone} className="zone-row"
                style={{display:"flex",flexDirection:"column",padding:"12px 14px",borderRadius:"14px",
                  background:bg, border:`1px solid ${color}18`, gap:"8px", cursor:"default",
                  transition:"all 0.2s"}}
                onMouseEnter={e=>gsap.to(e.currentTarget,{scale:1.01,duration:0.2})}
                onMouseLeave={e=>gsap.to(e.currentTarget,{scale:1,duration:0.2})}
              >
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                    <span style={{width:"8px",height:"8px",borderRadius:"50%",background:color,
                      boxShadow:`0 0 6px ${color}80`,display:"inline-block",flexShrink:0}}/>
                    <span style={{fontSize:"13px",color:"#374151",fontStyle:"italic",fontFamily:"'Times New Roman',Times,serif",
                      whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"130px",fontWeight:600}}>{zone}</span>
                  </div>
                  <span style={{fontFamily:"'Times New Roman',Times,serif",fontWeight:700,
                    fontSize:"18px",color,letterSpacing:"-0.02em"}}>{count}</span>
                </div>
                <div style={{height:"4px",borderRadius:"4px",background:"rgba(0,0,0,0.06)",overflow:"hidden"}}>
                  <div className="zone-bar-fill" data-width={widthPct}
                    style={{height:"100%",width:widthPct,borderRadius:"4px",
                      background:`linear-gradient(90deg,${color}88,${color})`}}/>
                </div>
              </li>
            );
          })
        ) : (
          <li style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"40px 20px",gap:"10px"}}>
            <span style={{fontSize:"30px",opacity:0.3}}>📡</span>
            <span style={{fontSize:"13px",color:"#9ca3af",textAlign:"center",fontStyle:"italic",fontFamily:"'Times New Roman',Times,serif"}}>
              No visitors currently inside
            </span>
          </li>
        )}
      </ul>

      {hasZones&&(
        <div style={{marginTop:"16px",paddingTop:"14px",borderTop:"1.5px solid rgba(0,0,0,0.05)",
          display:"flex",justifyContent:"space-between",fontSize:"11px",color:"#9ca3af",
          letterSpacing:"0.06em",textTransform:"uppercase",fontStyle:"italic",fontFamily:"'Times New Roman',Times,serif"}}>
          <span>{entries.length} zone{entries.length!==1?"s":""} active</span>
          <span style={{color:"#7c3aed",fontWeight:700}}>{totalInside} total</span>
        </div>
      )}
    </div>
  );
}

export default ZoneWidget;