import React, { useState } from "react";
import Plot from "react-plotly.js";

interface DataItem {
  trialarmid: string;
  patient_id: number;
}

interface BarChartProps {
  data: DataItem[]; 
  study_id: String;
}

const BarChart: React.FC<BarChartProps> = ({ data, study_id }) => {
  
  const patientCountByArm = data.reduce((acc, item) => {
    if (!acc[item.trialarmid]) {
      acc[item.trialarmid] = new Set(); 
    }
    acc[item.trialarmid].add(item.patient_id);
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
      (a, b) => patientCounts[a] - patientCounts[b]
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
    <div>
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
            `<b>Patient Matched:</b> %{x}<br>` +
            `<b>Trial Arm:</b> %{y}<br>` +
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
  );
};

export default BarChart;
