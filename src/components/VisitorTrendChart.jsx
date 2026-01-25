import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

function VisitorTrendChart() {
  const data = {
    labels: ["9 AM", "11 AM", "1 PM", "3 PM", "5 PM"],
    datasets: [
      {
        label: "Visitors",
        data: [2, 8, 15, 22, 28],
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79,70,229,0.2)",
        tension: 0.4,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false }
    }
  };

  return (
    <div className="widget-card">
      <h3>Visitor Trend (Today)</h3>
      <Line data={data} options={options} />
    </div>
  );
}

export default VisitorTrendChart;
