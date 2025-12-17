import React, { useState } from 'react';
import Plot from 'react-plotly.js';

interface DataItem {
  p: string | number;
  t: string;
  s: string;
}

interface TopBarChartProps {
  data: DataItem[]; 
  study_id: string;
  onBarClick: (patient: string, study: string) => void;
}

const TopBarChart: React.FC<TopBarChartProps> = ({ data, study_id , onBarClick}) => {

  const getStudyForPatient = ( patientId: string) => {
    const matchingItem = data.find(
      (item) => item.p === patientId
    );
    if (!matchingItem) return "N/A";
    try {
      return matchingItem.s;
    } catch (error) {
      console.error("Error parsing combineddata:", error);

    }
  };
  
  const patientTrialMap = data.reduce((acc, item) => {
    const idStr = String(item.p);
    if (!acc[idStr]) {
      acc[idStr] = new Set<string>();
    }
    acc[idStr].add(item.t);
    return acc;
  }, {} as Record<string, Set<string>>);
  
  const patientIds = Object.keys(patientTrialMap);
  const trialCounts = patientIds.map(id => patientTrialMap[id].size);
  
  
  const [isSorted, setIsSorted] = useState(false);
  const [chartData, setChartData] = useState({
    x: patientIds,
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
      x: sortedPatientIds,
      y: sortedTrialCounts,
    });

    setIsSorted(true);
  };

  
  const unsortData = () => {
    setChartData({
      x: patientIds,
      y: trialCounts,
    });

    setIsSorted(false);
  };

  const handleClick = (event: any) => {
    if (event.points.length > 0) {
      const xValue = event.points[0].x;
      const cbiPortalUrl= process.env.REACT_APP_CBIOPORTAL_URL
      const link = `${cbiPortalUrl}/patient?studyId=${study_id}&caseId=${xValue}`;
      window.open(link, "_blank");
    }
  };

  const maxTrialCount = Math.max(...chartData.y);
  const dynamicHeight = 75 * 7;
  const yAxisMax = Math.max(maxTrialCount, 100);
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
              color: 'rgb(51, 153, 255)',
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
            dtick: 10,
            range: [0, yAxisMax],
          },
          height: dynamicHeight,
          width: 1200, 
        }}
        onClick={(event) => {
          if (event.points.length > 0) {
            const patientValue = String(event.points[0].x);
            const studyValue = String(getStudyForPatient(patientValue));
            onBarClick(String(event.points[0].x),studyValue);
          }
        }}
      />
    </div>
  );
};

export default TopBarChart;
