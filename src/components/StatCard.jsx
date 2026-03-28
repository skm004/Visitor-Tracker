import "../styles/dashboard.css";

const ACCENT = {
  violet: { cardClass:"violet-accent", iconBg:"rgba(124,58,237,0.10)" },
  sky:    { cardClass:"sky-accent",    iconBg:"rgba(14,165,233,0.10)"  },
  mint:   { cardClass:"mint-accent",   iconBg:"rgba(16,185,129,0.10)"  },
  peach:  { cardClass:"peach-accent",  iconBg:"rgba(249,115,22,0.10)"  },
};

const TREND = {
  "Pending Approvals":   { label:"needs action", type:"neutral" },
  "Visitors Inside":     { label:"live",         type:"up"      },
  "Today's Visitors":    { label:"today",        type:"up"      },
  "Active Wi-Fi Zones":  { label:"online",       type:"up"      },
};

function StatCard({ title, value, accent = "violet", icon = "📊" }) {
  const a = ACCENT[accent] || ACCENT.violet;
  const trend = TREND[title] || { label:"live", type:"neutral" };
  return (
    <div className={`stat-card ${a.cardClass}`}>
      <div className="stat-card-top">
        <div className="stat-card-icon" style={{ background: a.iconBg }}>
          <span>{icon}</span>
        </div>
        <span className={`stat-trend ${trend.type}`}>{trend.label}</span>
      </div>
      <p className="stat-title">{title}</p>
      <h2 className="stat-value">{value}</h2>
      <p className="stat-sublabel">Live · Updated now</p>
    </div>
  );
}

export default StatCard;