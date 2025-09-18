import React, { useState } from "react";
import Plot from "react-plotly.js";
import "./PlotStyles.css";

interface DataItem {
  t: string;
  p: number;
}

interface BarChartProps {
  data: DataItem[]; 
  study_id: String;
  onBarClick: (patient: string, study: string) => void;
}

const BarChart: React.FC<BarChartProps> = ({ data, study_id, onBarClick }) => {
  
  const patientCountByArm = data.reduce((acc, item) => {
    if (!acc[item.t]) {
      acc[item.t] = new Set(); 
    }
    acc[item.t].add(item.p);
    return acc;
  }, {} as Record<string, Set<number>>);

  
  const trialArmNames = Object.keys(patientCountByArm);
  const patientCounts = trialArmNames.map(
    (arm) => patientCountByArm[arm].size
  );

  
  const [isSorted, setIsSorted] = useState(false);
  const [sortedData, setSortedData] = useState({
    x: trialArmNames,
    y: patientCounts,
  });

  
  const sortData = () => {
    const sortedIndices = [...Array(trialArmNames.length).keys()].sort(
      (a, b) => patientCounts[b] - patientCounts[a]
    );
    setSortedData({
      x: sortedIndices.map((i) => trialArmNames[i]),
      y: sortedIndices.map((i) => patientCounts[i]),
    });
    setIsSorted(true);
  };

  
  const unsortData = () => {
    setSortedData({
      x: trialArmNames,
      y: patientCounts,
    });
    setIsSorted(false);
  };
  const rowHeight = 25;
  const chartHeight = rowHeight * trialArmNames.length;

  const handleClick = (event: any) => {
    if (event.points.length > 0) {
      const xValue = event.points[0].x; 
      const yValue = event.points[0].y; 
      const cbiPortalUrl= process.env.REACT_APP_CBIOPORTAL_URL
      const link = `${cbiPortalUrl}/patient?studyId=${study_id}&caseId=${xValue}`;
      window.open(link, "_blank"); 
    }
  };

  return (
    <div className="barchart-container">
      <div className="chart-container">
      <div style={{ marginBottom: "10px" }}>
        <button onClick={sortData} disabled={isSorted}>
          Sort
        </button>
        <button onClick={unsortData} disabled={!isSorted}>
          Unsort
        </button>
      </div>
      <Plot
        data={[
          {
            x: sortedData.x, 
            y: sortedData.y, 
            type: "bar",
            marker: {
              color: "rgb(51, 153, 255)",
            },
            hovertemplate:
          `<b>Patient Matched:</b> %{y}<br>` +
            `<b>Trial Arm:</b> %{x}<br>` +
            '<extra></extra>',
          },
        ]}
        layout={{
          title: "Patient Count by Trial Arms",
          xaxis: {
            title: "Trial Arms",
            tickangle: -90,
            automargin: true,
            tickmode: "array",
            tickvals: sortedData.x,
              
            },
            yaxis: {
              title: "Unique Patient Count",
              

            },
            width: 200+ chartHeight,  // Fixed height for the entire chart
            height: 800,
            annotations: sortedData.x.map((patient_id, index) => ({
              x: patient_id,
              y: sortedData.y[index]+5,
              text: String(sortedData.y[index]),
              showarrow: false,
              font: {
                color: "black",
                size: 12,
              },
              textangle:"-90",
              xanchor: "center",
              yanchor: "bottom",
            })),
          margin: {
            l: 50,
            r: 20, 
            t: 50,
            b: 150,
          },
          autosize: false
        }}
        //onClick={handleClick}
      />
    </div>
    </div>
  );
};

export default BarChart;
