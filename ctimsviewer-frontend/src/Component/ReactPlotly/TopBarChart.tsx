import React, { useState } from 'react';
import Plot from 'react-plotly.js';

interface DataItem {
  patient_id: number;
  trialarmid: string;
}

interface TopBarChartProps {
  data: DataItem[]; 
  study_id: String;
}

const TopBarChart: React.FC<TopBarChartProps> = ({ data, study_id }) => {
  
  const patientCount = data.reduce((acc, item) => {
    if (!acc[item.patient_id]) {
      acc[item.patient_id] = 0;
    }
    acc[item.patient_id] += 1;
    return acc;
  }, {} as Record<number, number>);

  
  const patientIds = Object.keys(patientCount).map(Number); 
  const trialCounts = Object.values(patientCount);

  
  const [isSorted, setIsSorted] = useState(false);
  const [chartData, setChartData] = useState({
    x: patientIds.map(String), 
    y: trialCounts,
  });

  
  const sortData = () => {
    const sortedIndices = trialCounts
      .map((value, index) => ({ value, index }))
      .sort((a, b) => b.value - a.value)
      .map((item) => item.index);

    const sortedPatientIds = sortedIndices.map((index) => patientIds[index]);
    const sortedTrialCounts = sortedIndices.map((index) => trialCounts[index]);

    setChartData({
      x: sortedPatientIds.map(String), 
      y: sortedTrialCounts, 
    });

    setIsSorted(true);
  };

  
  const unsortData = () => {
    setChartData({
      x: patientIds.map(String), 
      y: trialCounts, 
    });

    setIsSorted(false);
  };

  const handleClick = (event: any) => {
    if (event.points.length > 0) {
      const xValue = event.points[0].x; 
      const yValue = event.points[0].y; 
      //const link = `CBIOPORTALURL/patient?studyId=${study_id}&caseId=${xValue}`;
      const cbiPortalUrl= process.env.REACT_APP_CBIOPORTAL_URL
      const link = `${cbiPortalUrl}/patient?studyId=${study_id}&caseId=${xValue}`;
      window.open(link, "_blank"); 
    }
  };

  /*
  const rowHeight = 25;
  const chartHeight = rowHeight * patientIds.length;
  */
  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
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
            x: chartData.x, 
            y: chartData.y, 
            type: 'bar',
            marker: {
              color: 'rgb(45, 94, 127)',
            },
            hovertemplate:
              `<b>Patient ID:</b> %{x}<br>` +
              `<b>Trial Arm:</b> %{y}<br>` +
              '<extra></extra>',
          },
        ]}
        layout={{
          title: 'Count of Trials for Each Patient ID',
          xaxis: {
            title: 'Patient ID',
            type: 'category',
            tickvals: chartData.x,
            ticktext: chartData.x,
            tickangle: -45,
            showticklabels: false,
          },
          yaxis: {
            title: 'Number of Trials Matched',
          },
          height: 600,  // Fixed height for the entire chart
          width: 800, 
        }}
        onClick={handleClick}
      />
    </div>
  );
};

export default TopBarChart;
