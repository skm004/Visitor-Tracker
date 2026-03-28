import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler } from "chart.js";
import { Line } from "react-chartjs-2";
import { useEffect, useRef, useState } from "react";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";
import gsap from "gsap";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

function getLast7Days() {
  return Array.from({ length:7 }, (_,i) => {
    const d = new Date(); d.setDate(d.getDate()-(6-i));
    return d.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
  });
}

function buildDailyData(visitors) {
  const days   = getLast7Days();
  const counts = new Array(7).fill(0);
  visitors.forEach(v => {
    if (!v?.visitDate) return;
    const idx = days.indexOf(v.visitDate);
    if (idx!==-1) counts[idx]++;
  });
  return { labels: days.map(d=>{ const p=d.split(" "); return `${p[0]} ${p[1]}`; }), counts };
}

const GsapLineDrawPlugin = {
  id:"gsapLineDraw",
  afterDatasetsUpdate(chart) {
    if (chart._gsapDrawn) return;
    chart._gsapDrawn=true; chart._drawProgress=0;
    if (chart._gsapTween) chart._gsapTween.kill();
    chart._gsapTween = gsap.to(chart,{
      _drawProgress:1, duration:1.8, ease:"power3.inOut", delay:0.3,
      onUpdate() {
        if (!chart.canvas?.isConnected) { chart._gsapTween?.kill(); return; }
        try { chart.update("none"); } catch(_) { chart._gsapTween?.kill(); }
      },
    });
  },
  beforeDatasetsDraw(chart) {
    const p=chart._drawProgress??1; if(p>=1) return;
    const {ctx,chartArea:a}=chart; if(!a) return;
    ctx.save(); ctx.beginPath();
    ctx.rect(a.left,a.top-20,(a.right-a.left)*p,a.bottom-a.top+40); ctx.clip();
  },
  afterDatasetsDraw(chart) { if((chart._drawProgress??1)<1) chart.ctx.restore(); },
  destroy(chart) { if(chart._gsapTween) chart._gsapTween.kill(); },
};

const GlowingDotPlugin = {
  id:"glowingDot",
  afterDraw(chart) {
    if((chart._drawProgress??1)<0.97) return;
    const meta=chart.getDatasetMeta(0);
    if(!meta?.data?.length) return;
    const last=meta.data[meta.data.length-1]; if(!last) return;
    const {x,y}=last.getCenterPoint?last.getCenterPoint():last;
    const ctx=chart.ctx;
    ctx.save();
    ctx.beginPath(); ctx.arc(x,y,14,0,Math.PI*2); ctx.fillStyle="rgba(124,58,237,0.08)"; ctx.fill();
    ctx.beginPath(); ctx.arc(x,y,8, 0,Math.PI*2); ctx.fillStyle="rgba(124,58,237,0.20)"; ctx.fill();
    ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2);
    ctx.fillStyle="#7c3aed"; ctx.shadowColor="#a78bfa"; ctx.shadowBlur=14; ctx.fill();
    ctx.restore();
  },
};

if(!ChartJS.registry.plugins.get("gsapLineDraw")) ChartJS.register(GsapLineDrawPlugin);
if(!ChartJS.registry.plugins.get("glowingDot"))   ChartJS.register(GlowingDotPlugin);

function StatPill({label,value,color,bg}) {
  return (
    <div style={{display:"flex",flexDirection:"column",padding:"10px 16px",borderRadius:"12px",
      background:bg,border:`1px solid ${color}25`,minWidth:"90px",boxShadow:`0 2px 12px ${color}15`}}>
      <span style={{fontSize:"10px",color:"#9ca3af",letterSpacing:"0.09em",textTransform:"uppercase",
        marginBottom:"4px",fontStyle:"italic",fontWeight:700}}>{label}</span>
      <span style={{fontSize:"22px",fontFamily:"'Times New Roman',Times,serif",
        fontWeight:700,color,lineHeight:1}}>{value}</span>
    </div>
  );
}

function VisitorTrendChart() {
  const [chartInfo, setChartInfo] = useState({labels:[],counts:[]});
  const wrapperRef=useRef(null), pillsRef=useRef(null), chartRef=useRef(null), mountedRef=useRef(true);

  useEffect(()=>{ mountedRef.current=true; return()=>{ mountedRef.current=false; }; },[]);

  useEffect(()=>{
    const unsub=onValue(ref(db,"visitorRequests"),snap=>{
      if(!mountedRef.current) return;
      if(!snap.exists()){setChartInfo(buildDailyData([]));return;}
      setChartInfo(buildDailyData(Object.values(snap.val()).filter(Boolean)));
    });
    return()=>unsub();
  },[]);

  useEffect(()=>{
    const chart=chartRef.current; if(!chart) return;
    if(chart._gsapTween) chart._gsapTween.kill();
    chart._gsapDrawn=false; chart._drawProgress=0;
    try{chart.update("none");}catch(_){}
  },[chartInfo]);

  useEffect(()=>{
    if(wrapperRef.current) gsap.fromTo(wrapperRef.current,{opacity:0,y:30},{opacity:1,y:0,duration:0.7,ease:"power3.out",delay:0.15});
    if(pillsRef.current?.children) gsap.fromTo(Array.from(pillsRef.current.children),
      {opacity:0,y:12,scale:0.88},{opacity:1,y:0,scale:1,duration:0.5,stagger:0.1,ease:"back.out(1.7)",delay:0.6});
  },[]);

  const peak=chartInfo.counts.length?Math.max(...chartInfo.counts):0;
  const total7Days=chartInfo.counts.reduce((a,b)=>a+b,0);
  const todayCount=chartInfo.counts[6]??0;

  const getGradient=(ctx,area)=>{
    const g=ctx.createLinearGradient(0,area.top,0,area.bottom);
    g.addColorStop(0,   "rgba(124,58,237,0.22)");
    g.addColorStop(0.5, "rgba(167,139,250,0.08)");
    g.addColorStop(1,   "rgba(167,139,250,0.00)");
    return g;
  };

  const chartData={
    labels:chartInfo.labels,
    datasets:[{
      label:"Visitors", data:chartInfo.counts,
      borderColor:"#7c3aed",
      backgroundColor:ctx=>{ const{ctx:c,chartArea:a}=ctx.chart; return a?getGradient(c,a):"transparent"; },
      borderWidth:2.5, tension:0.45, fill:true,
      pointRadius:ctx=>ctx.dataIndex===chartInfo.counts.length-1?0:5,
      pointBackgroundColor:"#7c3aed", pointBorderColor:"#fff", pointBorderWidth:2,
      pointHoverRadius:7, pointHoverBackgroundColor:"#a78bfa", pointHoverBorderColor:"#fff", pointHoverBorderWidth:2,
    }],
  };

  const chartOptions={
    responsive:true, maintainAspectRatio:true, animation:false,
    interaction:{mode:"index",intersect:false},
    plugins:{
      legend:{display:false},
      tooltip:{
        backgroundColor:"rgba(255,255,255,0.95)",
        borderColor:"rgba(124,58,237,0.2)", borderWidth:1,
        titleColor:"#1e1b4b", bodyColor:"#374151",
        padding:14, cornerRadius:12, displayColors:false,
        boxShadow:"0 8px 32px rgba(99,102,241,0.15)",
        callbacks:{ title:i=>i[0].label, label:i=>`  ${i.parsed.y} visitor${i.parsed.y!==1?"s":""}` },
      },
    },
    scales:{
      x:{ grid:{color:"rgba(0,0,0,0.04)",drawBorder:false}, border:{display:false},
        ticks:{color:"#9ca3af",font:{size:11,family:"'Times New Roman',Times,serif"}} },
      y:{ beginAtZero:true, grid:{color:"rgba(0,0,0,0.04)",drawBorder:false}, border:{display:false},
        ticks:{color:"#9ca3af",font:{size:11,family:"'Times New Roman',Times,serif"},stepSize:1,precision:0,padding:8} },
    },
  };

  return (
    <div className="widget-card" ref={wrapperRef} style={{opacity:0}}>
      <div className="widget-header">
        <h3>Visitor Trend — Last 7 Days</h3>
        <span className="widget-badge">● Live</span>
      </div>
      <div ref={pillsRef} style={{display:"flex",gap:"12px",marginBottom:"22px",flexWrap:"wrap"}}>
        <StatPill label="This Week" value={total7Days} color="#7c3aed" bg="rgba(124,58,237,0.07)" />
        <StatPill label="Peak Day"  value={peak}       color="#0ea5e9" bg="rgba(14,165,233,0.07)" />
        <StatPill label="Today"     value={todayCount} color="#10b981" bg="rgba(16,185,129,0.07)" />
      </div>
      <Line ref={chartRef} data={chartData} options={chartOptions} />
    </div>
  );
}

export default VisitorTrendChart;